var async = require('async'),
    webdriver = require('selenium-webdriver'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    mongo_data = require('../../modules/system/node-js/mongo-data'),
    MigrationEyeGeneLoincModel = require('./../createConnection').MigrationEyeGeneLoincModel,
    MigrationFormModel = require('./../createConnection').MigrationFormModel,
    MigrationOrgModel = require('./../createConnection').MigrationOrgModel,
    classificationShared = require('../../modules/system/shared/classificationShared')
    ;


var formCounter = 0;
var eyeGeneOrg = null;
var today = new Date().toJSON();

var loincURL_pre = 'http://s.details.loinc.org/LOINC/';
var loincURL_post = '.html?sections=Comprehensive';

function createForm(eyeGene) {
    var naming = [{
        designation: eyeGene.LONG_COMMON_NAME,
        definition: '',
        languageCode: "EN-US",
        context: {
            contextName: "Health",
            acceptability: "preferred"
        }
    }];
    var ids = [{source: 'LOINC', id: eyeGene.LOINC_NUM}];
    var newForm = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {name: "EyeGene"},
        createdBy: {username: 'batchloader'},
        created: today,
        imported: today,
        registrationState: {registrationStatus: "Qualified"},
        source: 'EyeGene',
        naming: naming,
        ids: ids,
        formElements: [],
        classification: []
    };
    var componentToAdd = ['Component'];
    var componentArray = eyeGene.COMPONENT.split('^');
    componentArray.forEach(function (component) {
        componentToAdd.push(component);
    });
    classificationShared.classifyItem(newForm, "EyeGene", componentToAdd);
    classificationShared.addCategory({elements: eyeGeneOrg.classifications}, componentToAdd);
    var classificationToAdd = ['Classification'];
    var classificationArray = eyeGene.CLASS.split('^');
    classificationArray.forEach(function (classification) {
        classificationToAdd.push(classification);
    });
    classificationShared.classifyItem(newForm, "EyeGene", classificationToAdd);
    classificationShared.addCategory({elements: eyeGeneOrg.classifications}, classificationToAdd);

    return newForm;
}
function run() {
    async.series([
        function (cb) {
            MigrationFormModel.remove({}, function (err) {
                if (err) throw err;
                MigrationOrgModel.remove({}, function (er) {
                    if (er) throw er;
                    new MigrationOrgModel({name: 'EyeGene'}).save(function (e) {
                        if (e) throw e;
                        cb();
                    });
                });
            });
        },
        function (cb) {
            MigrationOrgModel.findOne({"name": 'EyeGene'}).exec(function (error, org) {
                eyeGeneOrg = org;
                cb();
            });
        },
        function (cb) {
            var driver = new webdriver.Builder().forBrowser('firefox').build();
            var stream = MigrationEyeGeneLoincModel.find({LONG_COMMON_NAME: {$regex: 'panel'}}).stream();
            stream.on('data', function (eyeGene) {
                stream.pause();
                if (eyeGene.toObject) eyeGene = eyeGene.toObject();
                MigrationFormModel.find({'ids.id': eyeGene.LOINC_NUM}, function (err, existingForms) {
                    if (err) throw err;
                    if (existingForms.length === 0) {
                        var newForm = createForm(eyeGene);
                        newForm.formElements.push({
                            elementType: 'section',
                            instructions: {value: ''},
                            label: '',
                            formElements: []
                        });
                        driver.get(loincURL_pre + eyeGene.LOINC_NUM + loincURL_post);
                        driver.findElements(webdriver.By.xpath("//*[@class='Section1']/table[2]/tbody[1]/tr")).then(function (trs) {
                            var index = 1;
                            async.forEachSeries(trs, function (tr, doneOneTr) {
                                if (index === 1 || index === 2 || index === trs.length) {
                                    index++;
                                    doneOneTr();
                                } else {
                                    tr.findElements(webdriver.By.css('td')).then(function (tds) {
                                        tds[1].getText().then(function (text) {
                                            var loincId = text.trim();
                                            console.log(index);
                                            console.log(loincId);
                                            mongo_cde.byOtherIdAndNotRetired('EyeGene', loincId, function (err, existingCde) {
                                                if (err) {
                                                    console.log(err + ' cdeId: ' + loincId);
                                                    throw err;
                                                }
                                                if (!existingCde) {
                                                    console.log('cannot find this cde with loincId: ' + loincId);
                                                    console.log('formId: ' + eyeGene.LOINC_NUM);
                                                    process.exit(1);
                                                } else {
                                                    var question = {
                                                        cde: {
                                                            tinyId: existingCde.tinyId,
                                                            name: existingCde.naming[0].designation,
                                                            version: existingCde.version,
                                                            permissibleValues: existingCde.valueDomain.permissibleValues,
                                                            ids: existingCde.ids
                                                        },
                                                        datatype: existingCde.valueDomain.datatype,
                                                        datatypeNumber: existingCde.valueDomain.datatypeNumber,
                                                        datatypeText: existingCde.valueDomain.datatypeText,
                                                        uom: existingCde.valueDomain.uom,
                                                        answers: existingCde.valueDomain.permissibleValues
                                                    };
                                                    var formElement = {
                                                        elementType: 'question',
                                                        label: '',
                                                        question: question,
                                                        hideLabel: true,
                                                        formElements: []
                                                    };
                                                    newForm.formElements[0].formElements.push(formElement);
                                                    index++;
                                                    doneOneTr();
                                                }
                                            });
                                        });
                                    });
                                }

                            }, function doneAllTrs() {
                                driver.findElements(webdriver.By.xpath("Section20000000"))
                                var newFormObj = new MigrationFormModel(newForm);
                                newFormObj.save(function (err) {
                                    if (err) throw err;
                                    formCounter++;
                                    console.log('formCounter: ' + formCounter);
                                    stream.resume();
                                });
                            });
                        });
                    } else {
                        console.log('duplicated id: ' + eyeGene.LOINC_NUM);
                        process.exit(1);
                    }
                });
            });

            stream.on('end', function (err) {
                if (err) throw err;
                driver.quit();
                eyeGeneOrg.markModified('classifications');
                eyeGeneOrg.save(function (e) {
                    if (e) throw e;
                    if (cb) cb();
                    //noinspection JSUnresolvedVariable
                    process.exit(0);
                });
            });
        }]);
}

run();