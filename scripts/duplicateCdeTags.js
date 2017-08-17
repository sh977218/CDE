const _ = require('lodash');
const mongo_cde = require('../modules/cde/node-js/mongo-cde');
const DataElementModal = mongo_cde.DataElement;

let count = 0;
let cursor = DataElementModal.find({}).cursor();

cursor.eachAsync(function (dataElement) {
    return new Promise(function (resolve) {
        let naming = dataElement.toObject().naming;
        dataElement.naming = _.forEach(naming, n => {
            n.newTags = _.compact(n.tags.map(t => {
                if (t && t.tag) return t.tag;
            }));
        });
        dataElement.markModified("naming");
        dataElement.save(err => {
            if (err) throw err;
            count++;
            console.log("count: " + count);
            resolve();
        });
    });
});

cursor.on('close', function () {
    console.log("Finished all. count: " + count);
});
cursor.on('error', function (err) {
    console.log("error: " + err);
    process.exit(1);
});


