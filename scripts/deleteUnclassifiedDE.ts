import { forEachSeries, series } from 'async';
import { removeUnusedAttachment } from '../server/attachment/attachmentSvc';
import { DataElement } from '../server/cde/mongo-cde';

let count = 0;
let cond = {'stewardOrg.name': 'NCI', archived: false, classification: {$size: 0}};
let cursor = DataElement.find(cond).cursor();

function removeAttachments(de, cb) {
    let attachments = de.attachments;
    if (attachments && attachments.length > 0) {
        forEachSeries(attachments, function (attachmentFile: any, doneOneAttachment) {
            removeUnusedAttachment(attachmentFile.fileid, doneOneAttachment);
        }, function doneAllAttachments() {
            cb();
        });
    } else cb();
}

function removeHistories(de, cb) {
    let histories = de.history;
    if (histories && histories.length > 0) {
        forEachSeries(histories, function (history, doneOneHistory) {
            DataElement.findById(history).remove(err => {
                if (err) throw err;
                doneOneHistory();
            });
        }, function doneAllHistories() {
            cb();
        });
    } else cb();
}

cursor.eachAsync(function (dataElement) {
    return new Promise(function(resolve){
        let de = dataElement.toObject();
        series([
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
                console.log('count: ' + count);
                resolve();
            });
        });
    });
});

cursor.on('close', function () {
    console.log('Finished all. count: ' + count);
});
cursor.on('error', function (err) {
    console.log('error: ' + err);
    process.exit(1);
});
