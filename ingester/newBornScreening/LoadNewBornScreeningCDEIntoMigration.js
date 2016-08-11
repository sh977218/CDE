var async = require('async'),
    uom_datatype_map = require('../loinc/LOINC_UOM_DATATYPE_MAP').map,
    mongo_data = require('../../modules/system/node-js/mongo-data'),
    MigrationLoincModel = require('./../createMigrationConnection').MigrationLoincModel,
    MigrationNewBornScreeningCDEModel = require('./../createMigrationConnection').MigrationNewBornScreeningCDEModel,
    MigrationDataElementModel = require('./../createMigrationConnection').MigrationDataElementModel,
    MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel,
    MigrationLoincClassMappingModel = require('./../createMigrationConnection').MigrationLoincClassificationMappingModel,
    MigrationLoincScaleMappingModel = require('./../createMigrationConnection').MigrationLoincScaleMappingModel,
    classificationShared = require('../../modules/system/shared/classificationShared')
    ;

var loinc_num_datatype_map = {
    '62317-3': 'Date',
    '62328-0': 'Number'
};

const source = "LOINC";
const stewardOrgName = 'NLM';

var cdeCounter = 0;
var newBornScreeningOrg = null;
var today = new Date().toJSON();

var CLASSIFICATION_TYPE_MAP = {
    "1": "Laboratory Term Class",
    "2": "Clinical Term Class",
    "3": "Attachment Term Class",
    "4": "Survey Term Class"
};

var CONCEPT_MAP = {
    "Component": 'objectClass',
    "Fragments for synonyms": 'property',
    "Property": 'property',
    "Scale": 'property',
    "System": 'property',
    "Time": 'property',
    "Super System": 'property',
    "Divisors": 'property',
    "Method": 'property',
    "Multipart": 'property',
    "Challenge": 'property',
    "Suffix": 'property',
    "Quotients": 'property'
};
var statusMap = {
    'Active': 'Qualified'
};

function parseNaming(loinc) {
    var naming = [];
    var LOINCNAME = loinc['LOINC NAME']['LOINC NAME']['LOINC NAME'];
    if (LOINCNAME) {
        naming.push({
            designation: LOINCNAME,
            definition: '',
            languageCode: 'EN-US',
            context: {
                contextName: '',
                acceptability: 'preferred'
            }
        })
    }

    var NAME = loinc['NAME']['NAME'];
    if (NAME) {
        if (NAME['Long Common Name']) {
            naming.push({
                designation: NAME['Long Common Name'],
                definition: '',
                languageCode: "EN-US",
                context: {
                    contextName: "Long Common Name",
                    acceptability: 'preferred'
                }
            });
        }
        if (NAME['Shortname']) {
            naming.push({
                designation: NAME['Shortname'],
                definition: '',
                languageCode: "EN-US",
                context: {
                    contextName: "Shortname",
                    acceptability: 'preferred'
                }
            });
        }
    }
    if (loinc['TERM DEFINITION/DESCRIPTION(S)']) {
        loinc['TERM DEFINITION/DESCRIPTION(S)']['TERM DEFINITION/DESCRIPTION(S)'].forEach(function (t) {
            naming.push({
                designation: '',
                definition: t.Description,
                languageCode: "EN-US",
                context: {
                    contextName: t.Source,
                    acceptability: 'preferred'
                }
            })
        })
    }
    return naming;
}

function parseConcepts(loinc) {
    var concepts = {objectClass: [], property: [], dataElementConcept: []};
    if (loinc['PARTS']) {
        loinc['PARTS']['PARTS'].forEach(function (p) {
            concepts[CONCEPT_MAP[p['Part Type'].trim()]].push({
                name: p['Part Name'].replace('<i>', '').replace('</i>', '').trim(),
                origin: 'LOINC - Part - ' + p['Part Type'],
                originId: p['Part No']
            })
        })
    }
    return concepts;
}

function parseProperties(loinc) {
    var properties = [];
    if (loinc['RELATED NAMES']) {
        var table = '<table class="table table-striped">';
        var tr = '';
        loinc['RELATED NAMES']['RELATED NAMES'].forEach(function (n, i) {
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
    if (loinc['NAME']['NAME']['Fully-Specified Name']) {
        var ths = '';
        var tds = '';
        Object.keys(loinc['NAME']['NAME']['Fully-Specified Name']).forEach(function (key) {
            var th = '<th>' + key + '</th>';
            ths = ths + th;
            var value = loinc['NAME']['NAME']['Fully-Specified Name'][key];
            var td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        var table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'Fully-Specified Name', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['BASIC ATTRIBUTES']) {
        var ths = '';
        var tds = '';
        Object.keys(loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES']).forEach(function (key) {
            var th = '<th>' + key + '</th>';
            ths = ths + th;
            var value = loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES'][key];
            var td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        var table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'BASIC ATTRIBUTES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['EXAMPLE UNITS']) {
        var trs = '<tr><th>Source Type</th><th>Unit</th></tr>';
        loinc['EXAMPLE UNITS']['EXAMPLE UNITS'].forEach(function (eu) {
            trs = trs + '<tr><td>' + eu['Source Type'] + '</td><td>' + eu['Unit'] + '</td></tr>';
        });
        var table = '<table class="table table-striped">' + trs + '</table>';
        properties.push({key: 'EXAMPLE UNITS', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['COPYRIGHT']) {
        properties.push({
            key: 'COPYRIGHT',
            value: loinc['COPYRIGHT']['COPYRIGHT'],
            source: 'LOINC'
        })
    }
    return properties;
}

function parseReferenceDoc(loinc) {
    var referenceDocuments = [];
    if (loinc['ARTICLE']) {
        loinc['ARTICLE']['ARTICLE'].forEach(function (article) {
            referenceDocuments.push({
                uri: article.SourceLink,
                providerOrg: article.Source,
                title: article.Description,
                document: article.DescriptionLink
            });
        })
    }
    if (loinc['WEB CONTENT'] && loinc['WEB CONTENT']['WEB CONTENT']) {
        loinc['WEB CONTENT']['WEB CONTENT'].forEach(function (webContent) {
            var referenceDoc = {
                uri: webContent.SourceLink,
                providerOrg: webContent.Source,
                title: webContent.Copyright
            };
            referenceDocuments.push(referenceDoc);
        })
    }
    return referenceDocuments;
}

function parseValueDomain(loinc) {
    var valueDomain = {
        datatype: 'Text',
        uom: ''
    };
    var versionStr = loinc['VERSION']['VERSION'].replace('Generated from LOINC version', '').trim();
    var version = versionStr.substring(0, versionStr.length - 1);
    if (loinc['NORMATIVE ANSWER LIST'] || loinc['PREFERRED ANSWER LIST'] || loinc['EXAMPLE ANSWER LIST']) {
        valueDomain.datatype = 'Value List';
        var type;
        if (loinc['NORMATIVE ANSWER LIST']) type = 'NORMATIVE ANSWER LIST';
        if (loinc['PREFERRED ANSWER LIST']) type = 'PREFERRED ANSWER LIST';
        if (loinc['EXAMPLE ANSWER LIST']) type = 'EXAMPLE ANSWER LIST';
        valueDomain.ids = [{
            id: loinc[type][type].answerListId.ID,
            source: 'LOINC',
            version: version
        }];
        valueDomain.permissibleValues = loinc[type][type].answerList.sort('SEQ#').map(function (a) {
            return {
                permissibleValue: a['Answer'],
                valueMeaningName: a['Answer'],
                valueMeaningCode: a['Answer ID'],
                codeSystemName: 'LOINC'
            }
        });
    } else {
        if (loinc['EXAMPLE UNITS'] && loinc['EXAMPLE UNITS']['EXAMPLE UNITS']) {
            var unit = loinc['EXAMPLE UNITS']['EXAMPLE UNITS'][0].Unit;
            valueDomain.datatype = uom_datatype_map[unit];
        }
    }
    if (loinc_num_datatype_map[loinc.loincId]) {
        valueDomain.datatype = loinc_num_datatype_map[loinc.loincId];
    }
    return valueDomain;
}

function createCde(newBornScreening, loinc, cb) {
    var naming = parseNaming(loinc);
    var versionStr = loinc['VERSION']['VERSION'].replace('Generated from LOINC version', '').trim();
    var version = versionStr.substring(0, versionStr.length - 1);
    var ids = [{source: 'LOINC', id: loinc.loincId, version: version}];
    var properties = parseProperties(loinc);
    var referenceDocuments = parseReferenceDoc(loinc);
    var valueDomain = parseValueDomain(loinc);
    var concepts = parseConcepts(loinc);
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
        referenceDocuments: referenceDocuments,
        objectClass: {concepts: concepts.objectClass},
        property: {concepts: concepts.property},
        dataElementConcept: {concepts: concepts.dataElementConcept},
        stewardOrg: {name: stewardOrgName},
        valueDomain: valueDomain,
        classification: [{stewardOrg: {name: stewardOrgName}, elements: []}]
    };

    var classificationType = CLASSIFICATION_TYPE_MAP[newBornScreening.CLASSTYPE];
    var classificationToAdd = ['Newborn Screening', 'Classification'];
    var classificationArray = newBornScreening.CLASS.split('^');
    async.forEachSeries(classificationArray, function (classification, doneOneClassification) {
        MigrationLoincClassMappingModel.find({
            type: classificationType,
            key: classification
        }).exec(function (err, mappings) {
            if (err) throw err;
            else if (mappings.length === 0) throw "Can not find classification map.";
            else if (mappings.length > 1) throw "More than one classification map found";
            else {
                classificationToAdd.push(mappings[0].get('value'));
                doneOneClassification();
            }
        })
    }, function doneAllClassifications() {
        classificationShared.classifyItem(newCde, stewardOrgName, classificationToAdd);
        classificationShared.addCategory({elements: newBornScreeningOrg.classifications}, classificationToAdd);
        return cb(newCde);
    });
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
                console.log("Doing new born screening");
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
                                if (loinc['PARTS']) {
                                    async.forEach(loinc['PARTS']['PARTS'], function (p, doneOneP) {
                                        if (p['Part Type'] === 'Scale') {
                                            MigrationLoincScaleMappingModel.findOne({key: p['Part Name']}).exec(function (e, scaleMap) {
                                                if (e) throw e;
                                                p['Part Name'] = p['Part Name'] + ' <i>[' + scaleMap.get('Scale Type') + ']</i>';
                                                doneOneP();
                                            })
                                        } else {
                                            doneOneP();
                                        }
                                    }, function doneAllPs() {
                                        createCde(newBornScreening, loinc, function (newCde) {
                                            var newCdeObj = new MigrationDataElementModel(newCde);
                                            newCdeObj.save(function (err) {
                                                if (err) throw err;
                                                cdeCounter++;
                                                console.log('cdeCounter: ' + cdeCounter);
                                                stream.resume();
                                            });
                                        });
                                    });
                                }
                            }
                        });
                    } else {
                        throw 'Duplicated id: ' + newBornScreening.LOINC_NUM;
                    }
                });
            });

            stream.on('end', function (err) {
                console.log("End of Newborn Screening stream.");
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