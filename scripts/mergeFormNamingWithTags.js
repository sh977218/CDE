var async = require('async');
var mongo_form = require('../modules/form/node-js/mongo-form');
var FormModel = mongo_form.Form;

var recordsCount = 0;

function updateBatch(collection) {
    var query = {lastMigrationScript: null};
    collection.find(query).limit(2000).exec(function (findError, records) {
        console.log("found--");
        if (findError) throw findError;
        else {
            console.log("size: " + records.length);
            if (records.length > 0) {
                async.forEach(records, function (record, doneOneRecord) {
                    var newNamingArray = [];
                    record.get('naming').forEach(function (naming) {
                        // merge names
                        if (newNamingArray.filter(function (newName) {
                                return newName.designation === naming.designation &&
                                    newName.definition === naming.definition &&
                                    newName.definitionFormat === naming.definitionFormat &&
                                    newName.languageCode === naming.languageCode &&
                                    newName.source === naming.source
                            }).length > 0) {
                            newNamingArray.forEach(function (newName) {
                                if (newName.designation === naming.designation &&
                                    newName.definition === naming.definition &&
                                    newName.definitionFormat === naming.definitionFormat &&
                                    newName.languageCode === naming.languageCode &&
                                    newName.source === naming.source) {
                                    var existingTag = false;
                                    // merge tags
                                    newName.tags.forEach(function (t) {
                                        if (t === naming.context.contextName) {
                                            existingTag = true;
                                        }
                                    });
                                    if (!existingTag) {
                                        newName.tags.push({tag: naming.context.contextName})
                                    }
                                }
                            })
                        } else {
                            var newN = {
                                designation: naming.designation,
                                definition: naming.definition,
                                definitionFormat: naming.definitionFormat,
                                languageCode: naming.languageCode,
                                source: naming.source,
                                tags: []
                            };
                            if (naming.context.contextName) {
                                newN.tags.push({tag: naming.context.contextName});
                            }
                            newNamingArray.push(newN);
                        }
                    });
                    record.lastMigrationScript = "mergeNamingWithTags";
                    record.naming = newNamingArray;
                    record.markModified('naming');
                    record.context = {};
                    record.markModified('context');
                    record.save(function (saveError) {
                        if (saveError) throw saveError;
                        else {
                            recordsCount++;
                            console.log('recordsCount: ' + recordsCount);
                            doneOneRecord();
                        }
                    })
                }, function doneAllRecords() {
                    updateBatch(collection);
                });
            } else {
                console.log("Everything done");
                process.exit(0);
            }
        }
    });
}

updateBatch(FormModel);
