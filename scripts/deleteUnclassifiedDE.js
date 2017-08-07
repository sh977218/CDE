const async = require('async');
const mongo_cde = require('../modules/cde/node-js/mongo-cde');
const mongo_data = require('../modules/system/node-js/mongo-data');
const DataElementModal = mongo_cde.DataElement;

let count = 0;
let cond = {'stewardOrg.name': 'NCI', archived: false, classification: {$size: 0}};
let cursor = DataElementModal.find(cond).cursor();

function removeAttachments(de, cb) {
    let attachments = de.attachments;
    if (attachments && attachments.length > 0) {
        async.forEachSeries(attachments, function (attachment, doneOneAttachment) {
            mongo_data.removeAttachmentIfNotUsed(attachment.fileid, doneOneAttachment);
        }, function doneAllAttachments() {
            cb();
        });
    } else cb();
}

function removeHistories(de, cb) {
    let histories = de.history;
    if (histories && histories.length > 0) {
        async.forEachSeries(histories, function (history, doneOneHistory) {
            DataElementModal.findById(history).remove(err => {
                if (err) throw err;
                /*
                                if (count % 50 === 1) setTimeout(doneOneHistory, 3000);
                                else doneOneHistory();
                */
                doneOneHistory();
            });
        }, function doneAllHistories() {
            cb();
        });
    } else cb();
}

cursor.on('data', function (dataElement) {
    let de = dataElement.toObject();
    async.series([
        function (cb) {
            removeHistories(de, cb);
        },
        function (cb) {
            removeAttachments(de, cb);
        }
    ], function () {
        dataElement.remove(err => {
            if (err) throw err;
            count++;
            console.info("count: " + count);
        });
    });
});
cursor.on('close', function () {
    console.info("Finished all. count: " + count);
});
cursor.on('error', function (err) {
    console.info("error: " + err);
    process.exit(1);
});



