
function getTimestamp() {
    return new Date().toISOString().replace('T', ' ').substr(0, 19);
}

// add music from selected artist to queue, and play
function artist(player, values, callback) {
  
  var artistQuery = decodeURIComponent(values[0]);
  
  console.log(getTimestamp() + ': Artist ' + artistQuery);
  
  callback.invokeIntended = true;
  
  player.browse('A:ALBUMARTIST:'+artistQuery, null, null, function(error, result) {
    console.log(getTimestamp() + ': query success: ' + error);

    if (error) {
        console.log('Error searching for artist ' + artistQuery + ':' + error);
        callback({success: false, text: 'Error searching for artist ' + artistQuery});
    }
    else if (result.items.length == 0) {
        console.log('Error: artist ' + artistQuery + ' not found');
        callback({success: false, text: 'Artist ' + artistQuery + ' not found'});
    }
    else {
        // todo: check if this artist is already playing?
        var queueURI = "x-rincon-queue:" + player.uuid + "#0";
        
        // clear current queue, so we can fill with songs from artist
        player.removeAllTracksFromQueue(function (error) {
            if (error) {
                console.log('Error clearing the queue');
                callback({success: false, text: 'Error clearing the queue'});
            }
            else {
                player.addURIToQueue(result.items[0].uri, '', function (error) {
                    if (error) {
                      console.log("Error: problem loading playlist");
                      callback({success: false, text: 'Error loading playlist'});
                    }
                    else {
                        //need this to tell sonos to use queue (it may be playing from line in, etc)
                        player.setAVTransportURI(queueURI, "", function (error) {
                            console.log('Playing ' + result.items[0].title);
                            player.coordinator.play();
                            callback({success: true, text: 'Playing music from ' + result.items[0].title });
                        });
                    }
                });
            }
            
        });
    }
  });
}

module.exports = function (api) {
  api.registerAction('artist', artist);
}
