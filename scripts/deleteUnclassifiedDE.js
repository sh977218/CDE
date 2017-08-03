const async = require('async');
const mongo_cde = require('../modules/cde/node-js/mongo-cde');
const DataElementModal = mongo_cde.DataElement;

let count = 0;
let cond = {'stewardOrg.name': 'NCI', archived: false, classification: {$size: 0}};
let cursor = DataElementModal.find(cond).cursor();
cursor.on('data', function (dataElement) {
    let de = dataElement.toObject();
    let history = de.history;
    if (history && history.length > 0) {
        async.forEachSeries(history, function (h, doneOneH) {
            DataElementModal.findById(h).remove((err) => {
                if (err) throw err;
                count++;
                console.info("count: " + count);
                doneOneH();
            });
        }, function () {
            dataElement.remove((err) => {
                if (err) throw err;
                count++;
                console.info("count: " + count);
            });
        });
    } else dataElement.remove((err) => {
        if (err) throw err;
        count++;
        console.info("count: " + count);
    });
});
cursor.on('close', function () {
    console.info("Finished all. count: " + count);
});



