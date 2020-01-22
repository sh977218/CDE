import { forEachSeries, series } from 'async';
import { removeUnusedAttachment } from 'server/attachment/attachmentSvc';
import { dataElementModel } from 'server/cde/mongo-cde';

let count = 0;
const cond = {'stewardOrg.name': 'NCI', archived: false, classification: {$size: 0}};
const cursor = dataElementModel.find(cond).cursor();

function removeAttachments(de, cb) {
    const attachments = de.attachments;
    if (attachments && attachments.length > 0) {
        forEachSeries(attachments, (attachmentFile: any, doneOneAttachment) => {
            removeUnusedAttachment(attachmentFile.fileid, doneOneAttachment);
        }, function doneAllAttachments() {
            cb();
        });
    } else {
        cb();
    }
}

function removeHistories(de, cb) {
    if (de.history && de.history.length > 0) {
        forEachSeries(de.history, (history, doneOneHistory) => {
            dataElementModel.findById(history).remove(err => {
                if (err) {
                    throw err;
                }
                doneOneHistory();
            });
        }, function doneAllHistories() {
            cb();
        });
    } else {
        cb();
    }
}

cursor.eachAsync((dataElement) => {
    return new Promise((resolve) => {
        const de = dataElement.toObject();
        series([
            (cb) => {
                removeHistories(de, cb);
            },
            (cb) => {
                removeAttachments(de, cb);
            }
        ], () => {
            dataElement.remove(err => {
                if (err) {
                    throw err;
                }
                count++;
                console.log('count: ' + count);
                resolve();
            });
        });
    });
});

cursor.on('close', () => {
    console.log('Finished all. count: ' + count);
});
cursor.on('error', (err) => {
    console.log('error: ' + err);
    process.exit(1);
});
