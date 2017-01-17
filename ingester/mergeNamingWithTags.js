var async = require('async');
var mongo_cde = require('../modules/cde/node-js/mongo-cde');
var DataElementModel = mongo_cde.DataElement;
var mongo_form = require('../modules/form/node-js/mongo-form');
var FormModel = mongo_form.Form;

//var collections = [{name: 'cde', model: DataElementModel}, {name: 'form', model: FormModel}];
var collections = [{name: 'cde', model: DataElementModel}];
//var collections = [{name: 'form', model: FormModel}];

var query = {
    archived: null,
    "registrationState.registrationStatus": {$not: /Retired/}
};

async.forEach(collections, function (collectionObj, doneOneCollection) {
    var collection = collectionObj.model;
    var recordsCount = 0;
    collection.find(query).exec(function (findError, records) {
        if (findError) throw findError;
        else {
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
                console.log('done collection ' + collectionObj.name + ' recordsCount: ' + recordsCount);
                doneOneCollection();
            })
        }
    });
}, function doneAllCollections() {
    console.log('finished all collections');
    //process.exit(1);
});