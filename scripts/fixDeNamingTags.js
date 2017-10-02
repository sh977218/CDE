const mongo_cde = require('../modules/cde/node-js/mongo-cde');
const DataElementModal = mongo_cde.DataElement;

let count = 0;
let cursor = DataElementModal.find({}).cursor();

cursor.eachAsync(function (de) {
    return new Promise(function (resolve) {
        de.naming.forEach(n => {
            n.tags = n.newTags;
        });
        de.markModified("naming");
        de.save(err => {
            if (err) throw err;
            count++;
            console.log("count: " + count);
            resolve();
        });
    });
});

cursor.on('close', function () {
    console.log("Finished all. count: " + count);
    process.exit(1);
});

cursor.on('error', function (err) {
    console.log("error: " + err);
    process.exit(1);
});


