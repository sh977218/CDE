var async = require('async'),
    mongo_data = require('../../modules/system/node-js/mongo-data'),
    MigrationLoincModel = require('./../createConnection').MigrationLoincModel,
    MigrationNewBornScreeningCDEModel = require('./../createConnection').MigrationNewBornScreeningCDEModel,
    MigrationDataElementModel = require('./../createConnection').MigrationDataElementModel,
    MigrationOrgModel = require('./../createConnection').MigrationOrgModel,
    classificationShared = require('../../modules/system/shared/classificationShared')
    ;

const source = "LOINC";
const stewardOrgName = 'NLM';

var cdeCounter = 0;
var newBornScreeningOrg = null;
var today = new Date().toJSON();

var uom_datatype_map = {
    'cm': 'Number',
    'years': 'Date',
    'mm': 'Number',
    'ratio': 'Text',
    'mv': 'Number',
    'ms': 'Number',
    'Diopter': 'Text',
    'um': 'Number',
    'log': 'text',
    'deg': 'Number',
    'logMAR': 'Text',
    'ft/ft': 'Text',
    'cells': 'Text',
    'mm Hg': 'Number'
};

var statusMap = {
    'Active': 'Qualified'
};

function createCde(newBornScreening, loinc) {
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
    if (loinc['NAME']['Fully-Specified Name']) {
        var table = '<table class="table table-striped">';
        var ths = '';
        var tds = '';
        Object.keys(loinc['NAME']['Fully-Specified Name']).forEach(function (key) {
            var th = '<th>' + key + '</th>';
            ths = ths + th;
            var value = loinc['NAME']['Fully-Specified Name'][key];
            var td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        table = table + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'Fully-Specified Name', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    var newCde = {
        tinyId: mongo_data.generateTinyId(),
        createdBy: {username: 'BatchLoader'},
        created: today,
        imported: today,
        registrationState: {registrationStatus: "Qualified"},
        source: source,
        naming: naming,
        ids: ids,
        properties: properties,
        stewardOrg: {name: stewardOrgName},
        classification: [{stewardOrg: {name: stewardOrgName}, elements: []}]
    };
    var classificationToAdd = ['Classification'];
    var classificationArray = newBornScreening.CLASS.split('^');
    classificationArray.forEach(function (classification) {
        classificationToAdd.push(classification);
    });

    classificationShared.classifyItem(newCde, stewardOrgName, classificationToAdd);
    classificationShared.addCategory({elements: newBornScreeningOrg.classifications}, classificationToAdd);


    newCde.valueDomain = {};

    if (loinc['NORMATIVE ANSWER LIST'] || loinc['PREFERRED ANSWER LIST']) {
        newCde.valueDomain.datatype = 'Value List';
        var type;
        if (loinc['NORMATIVE ANSWER LIST']) type = 'NORMATIVE ANSWER LIST';
        if (loinc['PREFERRED ANSWER LIST']) type = 'PREFERRED ANSWER LIST';
        newCde.valueDomain.permissibleValues = loinc[type].answerList.sort('SEQ#').map(function (a) {
            return {permissibleValue: a['Answer'], valueMeaningName: a['Answer'], valueMeaningCode: a['Answer ID']}
        });
    } else {
        newCde.valueDomain.datatype = uom_datatype_map[newBornScreening.EXAMPLE_UNITS];
    }
    return newCde;
}
function run() {
    async.series([
        function (cb) {
            MigrationDataElementModel.remove({}, function (err) {
                if (err) throw err;
                MigrationOrgModel.remove({}, function (er) {
                    if (er) throw er;
                    new MigrationOrgModel({name: stewardOrgName, classifications: []}).save(function (e, o) {
                        if (e) throw e;
                        cb();
                    });
                });
            });
        },
        function (cb) {
            MigrationOrgModel.findOne({"name": stewardOrgName}).exec(function (error, org) {
                newBornScreeningOrg = org;
                cb();
            });
        },
        function (cb) {
            var stream = MigrationNewBornScreeningCDEModel.find({LONG_COMMON_NAME: {$regex: '^((?!panel).)*$'}}).stream();
            stream.on('data', function (newBornScreening) {
                console.log("doing new born screening");
                stream.pause();
                if (newBornScreening.toObject) newBornScreening = newBornScreening.toObject();
                MigrationDataElementModel.find({'ids.id': newBornScreening.LOINC_NUM}, function (err, existingCdes) {
                    if (err) throw err;
                    if (existingCdes.length === 0) {
                        MigrationLoincModel.find({
                            loincId: newBornScreening.LOINC_NUM,
                            info: {$not: /^no loinc name/i}
                        }, function (er, existingLoinc) {
                            if (er) throw er;
                            if (existingLoinc.length === 0) {
                                console.log("Cannot find loinc CDE for " + newBornScreening.LOINC_NUM);
                                //TODO: How to handle this?
                                stream.resume();
                            } else {
                                var loinc = existingLoinc[0].toObject();
                                var newCde = createCde(newBornScreening, loinc);
                                if (newBornScreening.EXAMPLE_UNITS)
                                    newCde.valueDomain.uom = newBornScreening.EXAMPLE_UNITS;
                                else if (newBornScreening.EXAMPLE_UCUM_UNITS)
                                    newCde.valueDomain.uom = newBornScreening.EXAMPLE_UCUM_UNITS;
                                else newCde.valueDomain.uom = '';
                                var newCdeObj = new MigrationDataElementModel(newCde);
                                newCdeObj.save(function (err) {
                                    if (err) throw err;
                                    cdeCounter++;
                                    console.log('cdeCounter: ' + cdeCounter);
                                    stream.resume();
                                });
                            }
                        });
                    } else {
                        throw 'duplicated id: ' + newBornScreening.LOINC_NUM;
                    }
                });
            });

            stream.on('end', function (err) {
                console.log("End of EyeGene stream.");
                if (err) throw err;
                newBornScreeningOrg.markModified('classifications');
                newBornScreeningOrg.save(function (e) {
                    if (e) throw e;
                    if (cb) cb();
                    //noinspection JSUnresolvedVariable
                    process.exit(0);
                });
            });
        }]);
}

run();