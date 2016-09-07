var REQUIRED_MAP = require('../Mapping/LOINC_REQUIRED_MAP').map;
var MULTISELECT_MAP = require('../Mapping/LOINC_MULTISELECT_MAP').map;

var DataElementModel = require('../../createNlmcdeConnection').DataElementModel;
var FormModel = require('../../createNlmcdeConnection').FormModel;
var MigrationFormModel = require('../../createMigrationConnection').MigrationFormModel;

var updateShare = require('../../updateShare');
var classificationShared = require('../../../modules/system/shared/classificationShared');
var CreateElt = require('../Shared/CreateElt');

exports.createForm = function (loinc, org, orgInfo, cb) {
    CreateElt.createElt(loinc, org, orgInfo, function (newForm) {
        newForm.formElements = [{
            elementType: 'section',
            formElements: []
        }];
        cb(newForm);
    });
};



exports.loadCde=function(element, fe, next) {
    DataElementModel.find({
        archived: null,
        "registrationState.registrationStatus": {$ne: "Retired"}
    }).elemMatch("ids", {source: 'LOINC', id: element['LOINC#']}).exec(function (err, existingCdes) {
        if (err) throw err;
        if (existingCdes.length === 0) {
            console.log('cannot find this cde with loincId: ' + element['LOINC#']);
            console.log('formId: ' + form.ids[0].id);
            process.exit(1);
        } else {
            var existingCde = existingCdes[0];
            var question = {
                instructions: {value: ''},
                cde: {
                    tinyId: existingCde.tinyId,
                    name: existingCde.naming[0].designation,
                    version: existingCde.version,
                    permissibleValues: existingCde.valueDomain.permissibleValues,
                    ids: existingCde.ids
                },
                required: REQUIRED_MAP[element['ANSWER CARDINALITY']],
                multiselect: MULTISELECT_MAP[element['ANSWER CARDINALITY']],
                datatype: existingCde.valueDomain.datatype,
                datatypeNumber: existingCde.valueDomain.datatypeNumber,
                datatypeText: existingCde.valueDomain.datatypeText,
                answers: existingCde.valueDomain.permissibleValues,
                uoms: []
            };
            if (element['Ex UCUM Units']) {
                question.uoms.push(element['Ex UCUM Units']);
            }
            var formElement = {
                elementType: 'question',
                instructions: {},
                label: existingCde.naming[0].designation,
                question: question,
                formElements: []
            };

            existingCde.naming.forEach(function (n) {
                if (n.context.contextName === "TERM DEFINITION/DESCRIPTION(S)") {
                    formElement.instructions.value = n.definition;
                }
            });
            fe.push(formElement);
            next();
        }
    });
};

exports.saveObj = function (form, next) {
    var loincId;
    form.ids.forEach(function(i){
        if(i.source==='LOINC') loincId = i.id;
    });
    MigrationFormModel.find({'ids.id':loincId}).exec(function(er,existingForms){
        if(er) throw er;
        if(existingForms.length === 0 ){
            var obj  = new MigrationFormModel(form);
            obj.save(function(err,o){
                if(err) throw err;
                next(o);
            })
        } else {
            next();
        }
    });
};

function processForm(migrationForm, existingForm, orgName, processFormCb) {
    // deep copy
    var newForm = existingForm.toObject();
    delete newForm._id;

    var deepDiff = updateShare.compareObjects(existingForm, migrationForm);
    if (!deepDiff || deepDiff.length === 0) {
        // nothing changed, remove from input
        existingForm.imported = importDate;
        existingForm.save(function (err) {
            if (err) throw "Unable to update import date";
            migrationForm.remove(function (err) {
                same++;
                if (err) throw "unable to remove";
                processFormCb();
            });
        });
    } else if (deepDiff.length > 0) {
        newForm.naming = migrationForm.naming;
        newForm.version = migrationForm.version;
        newForm.changeNote = "Bulk update from source";
        newForm.imported = importDate;
        newForm.referenceDocuments = migrationForm.referenceDocuments;
        newForm.formElements = migrationForm.formElements;
        updateShare.removePropertiesOfSource(newForm.properties, migrationForm.source);
        newForm.properties = newForm.properties.concat(migrationForm.properties);

        updateShare.removeClassificationTree(newForm, orgName);
        if (migrationForm.classification[0]) newForm.classification.push(migrationForm.classification[0]);
        newForm._id = existingForm._id;
        try {
            mongo_form.update(newForm, {username: "batchloader"}, function (err) {
                if (err) {
                    console.log("Cannot save Form.");
                    console.log(newForm);
                    throw err;
                }
                else migrationForm.remove(function (err) {
                    if (err) console.log("unable to remove " + err);
                    console.log('------------------------------\n');
                    processFormCb();
                    changed++;
                });
            });
        } catch (e) {
            console.log("newForm:\n" + newForm);
            console.log("existingForm:\n" + existingForm);
            throw e;
        }

    } else {
        console.log("Something wrong with deepDiff");
        console.log(deepDiff);
    }
}

exports.updateFormByOrgName = function (cb) {
    var migStream = MigrationFormModel.find().stream();
    migStream.on('data', function (migrationForm) {
        migStream.pause();
        classificationShared.sortClassification(migrationForm);
        var loincId;
        migrationForm.ids.forEach(function(i){
            if(i.source === 'LOINC')
                loincId = i.id;
        });
        var formCond = {
            archived: null,
            "registrationState.registrationStatus": {$not: /Retired/},
            created: {$ne: importDate}
        };
        FormModel.find(formCond)
            .where("ids").elemMatch(function (elem) {
            elem.where("source").equals('LOINC');
            elem.where("id").equals(loincId);
        }).exec(function (err, existingForms) {
            if (err) throw err;
            if (existingForms.length === 0) {
                //delete migrationForm._id;
                var mForm =migrationForm.toObject();
                delete mForm._id; //use mForm below!!!
                var createForm = new FormModel(mForm);
                createForm.save(function (err) {
                    if (err) {
                        console.log("Unable to create Form." + mForm);
                        process.exit(1);
                    }
                    console.log('\n------------------------------');
                    console.log('created new form with formId ' + formId);
                    migrationForm.remove(function (err) {
                        if (err) {
                            console.log("unable to remove form from migration: " + err);
                            process.exit(1);
                        }
                        console.log('removed form from migration, formId ' + formId);
                        console.log('------------------------------\n');
                    });
                });
            } else if (existingForms.length === 1) {
                console.log('\n------------------------------');
                console.log('found 1 form. processing form, tinyId ' + existingForms[0].tinyId);
                processForm(migrationForm, existingForms[0], orgName, findFormDone);
            } else {
                console.log('\n------------------------------');
                console.log('found ' + existingForms.length + ' forms. processing first form, tinyId ' + existingForms[0].tinyId);
                console.log('other forms tinyId are:');
                for (var j = 1; j < existingForms.length; j++)
                    console.log(existingForms[j].tinyId);
                process.exit(1);
            }
        });
    });

    migStream.on('error', function () {
        console.log("!!!!!!!!!!!!!!!!!! Unable to read from Stream !!!!!!!!!!!!!!");
        process.exit(1);
    });

    migStream.on('close', function () {
        cb();
    });
};