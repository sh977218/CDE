var async = require('async');
var mongo_cde = require('../modules/cde/node-js/mongo-cde');
var DataElementModel = mongo_cde.DataElement;

var recordsCount = 0;

function updateBatch(collection) {
    var query = {lastMigrationScript: null};
    collection.find(query).limit(500).exec(function (findError, records) {
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
                            newNamingArray.push({
                                designation: naming.designation ? naming.designation : '',
                                definition: naming.definition ? naming.definition : '',
                                definitionFormat: naming.definitionFormat ? naming.definitionFormat : '',
                                languageCode: naming.languageCode ? naming.languageCode : '',
                                tags: naming.context.contextName ? [{
                                    tag: naming.context.contextName
                                }] : [],
                                source: naming.source ? naming.source : ''
                            })
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

updateBatch(DataElementModel);
