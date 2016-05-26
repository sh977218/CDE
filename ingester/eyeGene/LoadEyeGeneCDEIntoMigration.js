var async = require('async'),
    mongo_data = require('../../modules/system/node-js/mongo-data'),
    MigrationEyeGeneLoincModel = require('./../createConnection').MigrationEyeGeneLoincModel,
    MigrationEyeGeneAnswerListModel = require('./../createConnection').MigrationEyeGeneAnswerListModel,
    MigrationDataElementModel = require('./../createConnection').MigrationDataElementModel,
    MigrationOrgModel = require('./../createConnection').MigrationOrgModel,
    MigrationLoincModal = require('./../createConnection').MigrationLoincModal,
    classificationShared = require('../../modules/system/shared/classificationShared')
    ;

const orgName = "Newborn Screening";

var cdeCounter = 0;
var eyeGeneOrg = null;
var today = new Date().toJSON();

var uom_datatype_map = {
    'cm': 'number',
    'years': 'date',
    'mm': 'number',
    'ratio': '',
    'mv': '',
    'ms': '',
    'Diopter': '',
    'um': '',
    'log': 'text',
    'deg': '',
    'logMAR': '',
    'ft/ft': 'number',
    'cells': '',
    'mm Hg': ''
};

function createCde(eyeGene, loinc) {
    var naming = [];
    if ((loinc['PART DEFINITION/DESCRIPTION(S)'] && loinc['PART DEFINITION/DESCRIPTION(S)'].length > 0 ) || ( loinc['TERM DEFINITION/DESCRIPTION(S)'] && loinc['TERM DEFINITION/DESCRIPTION(S)'].length > 0)) {
        if (loinc['PART DEFINITION/DESCRIPTION(S)'] && loinc['PART DEFINITION/DESCRIPTION(S)'].length > 0) {
            loinc['PART DEFINITION/DESCRIPTION(S)'].forEach(function (defintion) {
                var name = {
                    definition: defintion.Description,
                    languageCode: "EN-US",
                    context: {
                        contextName: "Long Common Name",
                        acceptability: "preferred"
                    }
                };
                if (loinc.NAME['LOINC NAME']) name.designation = loinc.NAME['LOINC NAME'];
                else name.designation = loinc['LOINC NAME'];
                naming.push(name);
            });
        }
        if (loinc['TERM DEFINITION/DESCRIPTION(S)']) {

            var name = {
                definition: loinc['TERM DEFINITION/DESCRIPTION(S)'].Description,
                languageCode: "EN-US",
                context: {
                    contextName: "Long Common Name",
                    acceptability: "preferred"
                }
            };
            if (loinc.NAME['LOINC NAME']) name.designation = loinc.NAME['LOINC NAME'];
            else name.designation = loinc['LOINC NAME'];
            naming.push(name);
        }
    } else {
        var name = {
            designation: loinc.NAME['LOINC NAME'],
            definition: '',
            languageCode: "EN-US",
            context: {
                contextName: "Long Common Name",
                acceptability: 'preferred'
            }
        };
        if (loinc.NAME['LOINC NAME']) name.designation = loinc.NAME['LOINC NAME'];
        else name.designation = loinc['LOINC NAME'];

        if (loinc['TERM DEFINITION/DESCRIPTION(S)']) name.definition = loinc['TERM DEFINITION/DESCRIPTION(S)'].Description;
        naming.push(name);
    }
    if (!loinc.NAME) {
        console.log(loinc);
        throw "no NAME";
    }
    naming.push({
        designation: loinc.NAME.Shortname,
        definition: '',
        languageCode: "EN-US",
        context: {
            contextName: "Shortname",
            acceptability: 'preferred'
        }
    });
    var ids = [{source: 'LOINC', id: loinc.loincId}];
    var properties = [];
    if (loinc['RELATED NAMES'] && loinc['RELATED NAMES'].length > 0) {
        var table = '<table class="table table-striped">';
        var tr = '';
        loinc['RELATED NAMES'].forEach(function (n, i) {
            var j = i % 3;
            var td = '<td>' + n + '</td>';
            if (j === 0) {
                tr = '<tr>' + td;
            } else if (j === 1) {
                tr = tr + td;
            } else {
                tr = tr + td + '</tr>';
                table = table + tr;
            }
        });
        table = table + '</table>';
        properties.push({key: 'RELATED NAMES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    var newCde = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {name: "LOINC"},
        createdBy: {username: 'batchloader'},
        created: today,
        imported: today,
        registrationState: {registrationStatus: "Qualified"},
        source: 'LOINC',
        naming: naming,
        ids: ids,
        properties: properties,
        classification: []
    };
    var componentToAdd = ['Component'];
    var componentArray = eyeGene.COMPONENT.split('^');
    componentArray.forEach(function (component) {
        componentToAdd.push(component);
    });

    classificationShared.classifyItem(newCde, orgName, componentToAdd);
    classificationShared.addCategory({elements: eyeGeneOrg.classifications}, componentToAdd);
    var classificationToAdd = ['Classification'];
    var classificationArray = eyeGene.CLASS.split('^');
    classificationArray.forEach(function (classification) {
        classificationToAdd.push(classification);
    });

    classificationShared.classifyItem(newCde, orgName, classificationToAdd);
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
                    new MigrationOrgModel({name: orgName}).save(function (e) {
                        if (e) throw e;
                        cb();
                    });
                });
            });
        },
        function (cb) {
            MigrationOrgModel.findOne({"name": orgName}).exec(function (error, org) {
                eyeGeneOrg = org;
                cb();
            });
        },
        function (cb) {
            var stream = MigrationEyeGeneLoincModel.find({LONG_COMMON_NAME: {$regex: '^((?!panel).)*$'}}).stream();
            stream.on('data', function (eyeGene) {
                console.log("doing eyegene");
                stream.pause();
                if (eyeGene.toObject) eyeGene = eyeGene.toObject();
                MigrationDataElementModel.find({'ids.id': eyeGene.LOINC_NUM}, function (err, existingCdes) {
                    if (err) throw err;
                    if (existingCdes.length === 0) {
                        MigrationLoincModal.find({loincId: eyeGene.LOINC_NUM, info: {$not:/^no loinc name/i}}, function (er, existingLoinc) {
                            if (er) throw er;
                            if (existingLoinc.length === 0) {
                                console.log("Cannot find loinc CDE for " + eyeGene.LOINC_NUM);
                                //TODO: How to handle this?
                                stream.resume();
                            } else {
                                var loinc = existingLoinc[0].toObject();
                                var newCde = createCde(eyeGene, loinc);
                                var valueDomain = {uom: eyeGene.EXAMPLE_UNITS};
                                if (eyeGene.AnswerListId && eyeGene.AnswerListId.length === 0) {
                                    valueDomain.datatype = uom_datatype_map[eyeGene.EXAMPLE_UNITS];
                                    var newCdeObj = new MigrationDataElementModel(newCde);
                                    newCdeObj.save(function (err) {
                                        if (err) throw err;
                                        cdeCounter++;
                                        console.log('cdeCounter: ' + cdeCounter);
                                        stream.resume();
                                    });
                                } else {
                                    valueDomain.datatype = 'Value List';
                                    MigrationEyeGeneAnswerListModel.find({AnswerListId: eyeGene.AnswerListId}).sort({Sequence: 1}).exec(function (err, existingAnswerLists) {
                                        if (err) throw err;
                                        if (existingAnswerLists && existingAnswerLists.length === 0) {
                                            console.log('cannot find answer list of ' + eyeGene.AnswerListId);
                                        } else if (existingAnswerLists && existingAnswerLists.length > 0) {
                                            valueDomain.permissibleValues = [];
                                            valueDomain.identifiers = [];
                                            valueDomain.identifiers.push({source: 'LOINC', id: eyeGene.AnswerListId});
                                            existingAnswerLists.forEach(function (existingAnswerList) {
                                                valueDomain.permissibleValues.push({
                                                    valueMeaningName: existingAnswerList.get('AnswerString'),
                                                    valueMeaningCode: existingAnswerList.get('AnswerStringId'),
                                                    permissibleValue: existingAnswerList.get('AnswerString'),
                                                    codeSystemName: 'LOINC'
                                                });
                                            });
                                            newCde.valueDomain = valueDomain;
                                        } else {
                                            throw "answer list error";
                                        }
                                        var newCdeObj = new MigrationDataElementModel(newCde);
                                        newCdeObj.save(function (err) {
                                            if (err) throw err;
                                            cdeCounter++;
                                            console.log('cdeCounter: ' + cdeCounter);
                                            stream.resume();
                                        });
                                    });
                                }
                            }
                        });
                    } else {
                        throw 'duplicated id: ' + eyeGene.LOINC_NUM;
                    }
                });
            });

            stream.on('end', function (err) {
                console.log("End of EyeGene stream.");
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