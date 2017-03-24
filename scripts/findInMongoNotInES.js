var mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    esClient = require('../modules/system/node-js/elastic').esClient,
    config = require('config')
    ;

var i = 0;

var stream = mongo_cde.getStream({archived: false});
stream.on('data', function(elt) {
    stream.pause();
    esClient.search({
        index: config.elastic.index.name,
        type: 'dataelement',
        body: {
            query: {
                term: {
                    tinyId: elt.tinyId
                }
            }
        }
    }).then(function(resp) {
        i++;
        if (i % 500 === 0) {
            console.log("Done: " + i);
        }
        if (resp.hits.hits.length !== 1) {
            console.log("Not Found: " + elt.tinyId);
        }
        stream.resume();
    }, function (err) {
        console.log("ERROR: " + err);
    });
});
stream.on('end', function() {
    process.exit();
});


