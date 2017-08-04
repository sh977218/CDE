const async = require('async');
const mongo_cde = require('../modules/cde/node-js/mongo-cde');
const DataElementModal = mongo_cde.DataElement;

let count = 0;
let cond = {'stewardOrg.name': 'NCI', archived: false, classification: {$size: 0}};
let cursor = DataElementModal.find(cond).cursor();

function removeAttachement(histories, cb) {
}

function removeHistory(attachements, cb) {

}

cursor.on('data', function (dataElement) {
    let de = dataElement.toObject();
    let histories = de.history;
    if (histories && histories.length > 0) {
        async.forEachSeries(histories, function (history, doneOneHistory) {
            DataElementModal.findById(history).remove((err) => {
                if (err) throw err;
                count++;
                console.info("count: " + count);
                doneOneHistory();
            });
        }, function doneAllHistories() {
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
    process.exit(1);
});



