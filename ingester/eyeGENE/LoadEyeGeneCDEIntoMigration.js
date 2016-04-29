var async = require('async'),
    mongo_data = require('../../modules/system/node-js/mongo-data'),
    MigrationEyeGeneLoincModel = require('./../createConnection').MigrationEyeGeneLoincModel,
    MigrationEyeGeneAnswerListModel = require('./../createConnection').MigrationEyeGeneAnswerListModel,
    MigrationDataElementModel = require('./../createConnection').MigrationDataElementModel,
    MigrationOrgModel = require('./../createConnection').MigrationOrgModel,
    classificationShared = require('../../modules/system/shared/classificationShared')
    ;


var cdeCounter = 0;
var eyeGeneOrg = null;
var today = new Date().toJSON();

var uom_datatype_map = {
    'cm': 'number'
};

function createCde(eyeGene) {
    var naming = [{
        designation: eyeGene.LONG_COMMON_NAME,
        definition: '',
        languageCode: "EN-US",
        context: {
            contextName: "Health",
            acceptability: "preferred"
        }
    }];
    var ids = [{source: 'EyeGene', id: eyeGene.LOINC_NUM}];
    var newCde = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {name: "EyeGene"},
        createdBy: {username: 'batchloader'},
        created: today,
        imported: today,
        registrationState: {registrationStatus: "Qualified"},
        source: 'EyeGene',
        naming: naming,
        ids: ids,
        classification: []
    };
    var componentToAdd = ['COMPONENT'];
    var componentArray = eyeGene.COMPONENT.split('^');
    componentArray.forEach(function (component) {
        componentToAdd.push(component);
    });
    classificationShared.classifyItem(newCde, "EyeGene", componentToAdd);
    classificationShared.addCategory({elements: eyeGeneOrg.classifications}, componentToAdd);
    var classificationToAdd = ['Classification'];
    var classificationArray = eyeGene.CLASS.split('^');
    classificationArray.forEach(function (classification) {
        classificationToAdd.push(classification);
    });
    classificationShared.classifyItem(newCde, "EyeGene", classificationToAdd);
    classificationShared.addCategory({elements: eyeGeneOrg.classifications}, classificationToAdd);

    return newCde;
}
function run() {
    async.series([
        function (cb) {
            MigrationDataElementModel.remove({}, function (err) {
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
            var stream = MigrationEyeGeneLoincModel.find({}).stream();
            stream.on('data', function (eyeGene) {
                stream.pause();
                MigrationDataElementModel.find({'ids.id': eyeGene.LOINC_NUM}, function (err, existingCdes) {
                    if (err) throw err;
                    if (existingCdes.length === 0) {
                        var newCde = createCde(eyeGene);
                        var valueDomain = {};
                        if (eyeGene.AnswerListId.length === 0) {
                            valueDomain.uom = eyeGene.EXAMPLE_UNITS;
                            valueDomain.datatype = uom_datatype_map[eyeGene.EXAMPLE_UNITS];
                        } else {
                            valueDomain.uom = eyeGene.EXAMPLE_UNITS;
                            valueDomain.datatype = 'Value List';
                            MigrationEyeGeneAnswerListModel.find({AnswerListId: eyeGene.AnswerListId}).sort({Sequence: 1}).exec(function (err, existingAnswerLists) {
                                if (err) throw err;
                                if (existingAnswerLists && existingAnswerLists.length === 0) {
                                    console.log('cannot find answer list of ' + eyeGene.AnswerListId);
                                    var newCdeObj = new MigrationDataElementModel(newCde);
                                    newCdeObj.save(function (err) {
                                        if (err) throw err;
                                        cdeCounter++;
                                        console.log('cdeCounter: ' + cdeCounter);
                                        stream.resume();
                                    });
                                } else if (existingAnswerLists && existingAnswerLists.length > 0) {
                                    valueDomain.permissibleValues = [];
                                    existingAnswerLists.forEach(function (existingAnswerList) {
                                        valueDomain.permissibleValues.push({
                                            permissibleValue: existingAnswerList.AnswerString,
                                            valueMeaningName: existingAnswerList.AnswerString,
                                            valueMeaningDefinition: ''
                                        });
                                    });
                                    newCde.valueDomain = valueDomain;
                                    var newCdeObj = new MigrationDataElementModel(newCde);
                                    newCdeObj.save(function (err) {
                                        if (err) throw err;
                                        cdeCounter++;
                                        console.log('cdeCounter: ' + cdeCounter);
                                        stream.resume();
                                    });
                                } else {
                                    console.log('answer list error.');
                                    process.exit(0);
                                }
                            });
                        }
                    } else {
                        console.log('duplicated id: ' + eyeGene.LOINC_NUM);
                        process.exit(1);
                    }
                });
                stream.resume();
            });

            stream.on('end', function (err) {
                if (err) throw err;
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