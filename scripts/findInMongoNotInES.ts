import * as Config from 'config';
import { DataElementDocument, getStream } from 'server/cde/mongo-cde';
import { esClient } from 'server/system/elastic';

const config = Config as any;
let i = 0;

const stream = getStream({archived: false});
stream.on('data', (elt: DataElementDocument) => {
    stream.pause();
    esClient.search({
        index: config.elastic.index.name,
        type: '_doc',
        body: {
            query: {
                term: {
                    tinyId: elt.tinyId
                }
            }
        }
    }).then((resp) => {
        i++;
        if (i % 500 === 0) {
            console.log('Done: ' + i);
        }
        if (resp.body.hits.hits.length !== 1) {
            console.log('Not Found: ' + elt.tinyId);
        }
        stream.resume();
    }, (err) => {
        console.log('ERROR: ' + err);
    });
});
stream.on('end', () => {
    process.exit();
});
