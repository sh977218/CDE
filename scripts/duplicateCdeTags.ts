import { compact, forEach } from 'lodash';
import { DataElement } from '../server/cde/mongo-cde';

let count = 0;
let cursor = DataElement.find({}).cursor();

cursor.eachAsync(function (dataElement) {
    return new Promise(function (resolve) {
        let naming = dataElement.toObject().naming;
        dataElement.naming = forEach(naming, n => {
            n.newTags = compact(n.tags.map(t => {
                if (t && t.tag) return t.tag;
            }));
        });
        dataElement.markModified('naming');
        dataElement.save(err => {
            if (err) throw err;
            count++;
            console.log('count: ' + count);
            resolve();
        });
    });
});

cursor.on('close', function () {
    console.log('Finished all. count: ' + count);
});

cursor.on('error', function (err) {
    console.log("error: " + err);
    process.exit(1);
});
