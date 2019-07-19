import { getStream } from '../server/cde/mongo-cde';
import { esClient } from '../server/system/elastic';
import * as Config from 'config';

const config = Config as any;
let i = 0;

const stream = getStream({archived: false});
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
