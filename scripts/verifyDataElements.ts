import { DataElement } from '../server/cde/mongo-cde';
import { transferClassifications } from '../shared/system/classificationShared';

function fixEmptyClassification(cde) {
    let cdeObj = cde.toObject();
    cde.classification = cdeObj.classification.filter(c => c.stewardOrg.name && c.elements.length);
};

function fixDuplicatedClassification(cde) {
    let cdeObj = cde.toObject();
    transferClassifications(cdeObj, cde);
};

function fixCde(error, cde) {
    console.log(cde._id + ' has error: ' + error + ' fixing.');
    let message = error.message;
    if (message.indexOf('DataElement validation failed: classification:') !== -1) {
        fixEmptyClassification(cde);
    } else if (message.indexOf('DataElement validation failed: classification: Duplicate Steward Classification') !== -1) {
        fixDuplicatedClassification(cde);
    } else {
        console.log(error);
        throw error;
    }
}


(function () {
    let count = 0;
    let cond = {
        archived: false,
        /*
                lastMigrationScript: {$ne: "verifyDataElements"}
        */
    };
    let cursor = DataElement.find(cond).cursor();

    cursor.eachAsync(function (cde) {
        return new Promise(function (resolve, reject) {
            cde.save((error1, savedCde) => {
                if (error1) {
                    fixCde(error1, cde);
                    cde.save(error2 => {
                        if (error2) {
                            console.log(cde._id + ' still has error2: ' + error2 + ' terminated.');
                            reject(cde._id + ' ' + error2);
                        } else {
                            console.log(cde._id + 'fixed and saved.');
                            resolve();
                        }
                    })
                } else {
                    savedCde.lastMigrationScript = "verifyDataElements";
                    savedCde.save(error => {
                        if (error) {
                            reject(error);
                        } else {
                            console.log(savedCde._id + " passed validation. saved.")
                            resolve();
                        }
                    });
                }
            })
        });
    }).catch(e => {
        if (e) {
            console.log(e);
        }
    });

    cursor.on('close', function () {
        console.log("Finished all. count: " + count);
    });
    cursor.on('error', function (err) {
        console.log("error: " + err);
        process.exit(1);
    });

})();