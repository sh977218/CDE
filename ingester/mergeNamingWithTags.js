var async = require('async');
var mongo_cde = require('../modules/cde/node-js/mongo-cde');
var DataElementModel = mongo_cde.DataElement;
var mongo_form = require('../modules/form/node-js/mongo-form');
var FormModel = mongo_form.Form;

var collections = [DataElementModel, FormModel];

var query = {
    archived: null,
    "registrationState.registrationStatus": {$not: /Retired/}
};

async.forEach(collections, function (collection, doneOneCollection) {
    var recordsCount = 0;
    collection.find(query).exec(function (findError, records) {
        if (findError) throw findError;
        else {
            async.forEach(records, function (record, doneOneRecord) {
                var newNamingArray = [];
                record.get('naming').forEach(function (naming) {
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
                                newName.tags.forEach(function (t) {
                                    
                                })
                            }
                        })
                    } else {
                        newNamingArray.push({
                            designation: naming.designation,
                            definition: naming.definition,
                            definitionFormat: naming.definitionFormat,
                            languageCode: naming.languageCode,
                            tags: [{
                                tag: naming.context.contextName
                            }],
                            source: naming.source
                        })
                    }
                });
                recordsCount++;
                console.log('recordsCount: ' + recordsCount);
                doneOneRecord();
            }, function doneAllRecords() {
                console.log('done collection ' + collection.toString() + ' recordsCount: ' + recordsCount);
                doneOneCollection();
            })
        }
    });
}, function doneAllCollections() {
    console.log('finished all collections');
    process.exit(1);
});