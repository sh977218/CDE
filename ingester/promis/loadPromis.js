// 4) Loads PROMIS to DB
// node ingester/promis/loadPromis.js ../promis 2014-01

import { BATCHLOADER } from 'ingester/shared/utility';
import { addCategory } from 'shared/classification/classificationShared';

var promisDir = process.argv[2];

var fs = require('fs'),
    https = require('https'),
    mongo_cde = require('../../server/cde/mongo-cde'),
    mongo_form = require('../../server/form/mongo-form'),
    config = require('config'),
    mongo_data_system = require('../../server/system/mongo-data'),
    async = require('async'),
    loinc = JSON.parse(fs.readFileSync(promisDir + '/loinc.json')),
    loadLoincPv = require('./loadLoincPVs'),
    formClassifMap = JSON.parse(fs.readFileSync(promisDir + '/formMap.json')),
    updateShare = require('../updateShare')
;

var lostForms = [];


var orgName = "PROMIS / Neuro-QOL";
var sourceName = "Assessment Center";

var date = process.argv[3];
if (!promisDir) {
    console.log("missing promisDir arg");
    process.exit(1);
}

var twoDaysAgo = Date.now() - 2 * 24 * 3600 * 1000;

var ignoreTerms = ["Neuro-QoL", "Banco", "Capacidad", "Comportamiento", "Ansiedad",
    "Depresión", "Intensidad", "Agotamiento", "Alteraciones", "Sentimentios", "Satisfacción",
    "Bank", "sociales", "Enojo", "emocional", "extremidades", "sueño", "Estigma", "positivos",
    "Función", "Pool"];

var doFile = function (file, cb) {
    fs.readFile(promisDir + "/forms" + date + "/" + file, function (err, formData) {
        if (err) console.log("err in file: " + file + "\n" + err);
        var form = JSON.parse(formData);
        var ignoreThis = false;
        ignoreTerms.forEach(t => {
            if (form.name.indexOf(t) > -1) {
                ignoreThis = true;
            }
        });
        if (ignoreThis) {
            return cb();
        }
        async.eachSeries(form.content.Items, function (item, oneDone) {
            var cde = {
                stewardOrg: {name: orgName},
                source: sourceName,
                naming: [
                    {designation: "", definition: "N/A", tags: []}
                ],
                ids: [{source: sourceName, id: item.ID}],
                valueDomain: {datatype: "Text"},
                classification: [{stewardOrg: {name: orgName}, elements: []}],
                registrationState: {registrationStatus: "Qualified"}
            };
            item.Elements.forEach(function (element) {
                if (!element.Map) {
                    cde.naming[0].designation = cde.naming[0].designation + " " + element.Description;
                    cde.naming[0].designation = cde.naming[0].designation.trim();
                } else {
                    if (cde.valueDomain.datatype !== 'Value List') {
                        cde.valueDomain.datatype = 'Value List';
                        cde.valueDomain.permissibleValues = [];
                    }
                    element.Map.forEach(function (map) {
                        cde.valueDomain.permissibleValues.push({
                            permissibleValue: map.Value,
                            valueMeaningName: map.Description
                        });
                    });
                }
            });
            if (cde.naming[0].designation.indexOf("In the past 7 days") === 0) {
                cde.naming.push({
                    designation: cde.naming[0].designation.substr(18),
                    tags: [{tag: "In the past 7 days"}]
                });
            }
            var found = false;
            loinc.forEach(function (l) {
                var processString = function (str) {
                    return str.toLowerCase().replace(/[^A-z]/g, "");
                };
                var loincName = processString(l.name);
                var loincName2 = processString(l.name2);
                var cdeName = processString(cde.naming[0].designation);
                if (loincName === cdeName || loincName2 === cdeName || cde.ids[0].id === l.sourceId) {
                    if (found) console.log("ID found twice: " + cdeName);
                    cde.ids.push({source: "LOINC", id: l.loincCode, version: "2.58"});
                    found = true;
                }
            });
            var c1;
            if (form.name.indexOf("Neuro-QOL") > -1) {
                c1 = "Neuro-QOL Measures";
            } else if (form.name.indexOf("PROMIS") > -1) {
                c1 = "PROMIS Instruments";
            } else {
                c1 = "Other";
            }
            var l2;
            if (form.name.indexOf("Ped Bank") > -1) l2 = "Pediatric Banks";
            else if (form.name.indexOf("Ped SF") > -1) l2 = "Pediatric Short Forms";
            else if (form.name.indexOf("Bank") > -1) l2 = "Adult Banks";
            else if (form.name.indexOf("SF") > -1) l2 = "Adult Short Forms";
            else l2 = "Other";
            mongo_cde.byOtherId("Assessment Center", item.ID, function (err, duplicate) {
                if (err) {
                    console.log("Unexpected Duplicate CDE: " + item.ID);
                    process.exit(1);
                }
                if (duplicate) {
                    var classif = duplicate.classification.find(e => e.stewardOrg.name === orgName);
                    if (duplicate.updated > twoDaysAgo) {
                        updateShare.removeClassificationTree(duplicate, orgName);
                        //classifyEltNoDuplicate(form, duplicate, true);
                        classif = {stewardOrg: {name: orgName}, elements: []};
                        duplicate.classification.push(classif);
                    }
                    if (formClassifMap[form.name]) {
                        addCategory(classif, [c1].concat(formClassifMap[form.name]).concat(form.name));
                        addCategory(fakeTree, [c1].concat(formClassifMap[form.name]).concat(form.name));
                    } else {
                        addCategory(fakeTree, [c1, l2, form.name]);
                        addCategory(duplicate.classification[0], [c1, l2, form.name]);
                    }
                    duplicate.ids = cde.ids;
                    duplicate.naming = cde.naming;
                    duplicate.valueDomain = cde.valueDomain;
                    mongo_cde.update(duplicate, BATCHLOADER, oneDone);
                } else {
                    if (formClassifMap[form.name]) {
                        addCategory(cde.classification[0], [c1].concat(formClassifMap[form.name]).concat(form.name));
                        addCategory(fakeTree, [c1].concat(formClassifMap[form.name]).concat(form.name));
                    } else {
                        addCategory(fakeTree, [c1, l2, form.name]);
                        addCategory(cde.classification[0], [c1, l2, form.name]);
                    }
                    mongo_cde.create(cde, user, oneDone);
                }
            });
        }, cb);
    });
};

var loadForm = function (file, cb) {
    fs.readFile(promisDir + "/forms" + date + "/" + file, function (err, formData) {
        if (err) console.log("err " + err);
        var pForm = JSON.parse(formData);

        var ignoreThis = false;
        ignoreTerms.forEach(t => {
            if (pForm.name.indexOf(t) > 0) {
                ignoreThis = true;
            }
        });
        if (ignoreThis) {
            return cb();
        }

        if (formClassifMap[pForm.name]) addCategory(fakeTree, formClassifMap[pForm.name]);

        var form = {
            stewardOrg: {name: orgName},
            source: sourceName,
            naming: [
                {designation: pForm.name, definition: "N/A"}
            ],
            ids: [{source: sourceName, id: file.substr(0, 36)}],
            registrationState: {registrationStatus: "Candidate"},
            formElements: [],
            classification: [{stewardOrg: {name: orgName}, elements: []}]
            , isCopyrighted: true
            , copyright: {
                authority: "PROMIS Health Organization"
            }
        };
        var l2;
        if (pForm.name.indexOf("Ped Bank") > -1) l2 = "Pediatric Banks";
        else if (pForm.name.indexOf("Ped SF") > -1) l2 = "Pediatric Short Forms";
        else if (pForm.name.indexOf("Bank") > -1) l2 = "Adult Banks";
        else if (pForm.name.indexOf("SF") > -1) l2 = "Adult Short Forms";
        else l2 = "Other";
        if (formClassifMap[pForm.name]) {
            addCategory(form.classification[0], (formClassifMap[pForm.name]).concat(pForm.name));
        } else if (pForm.name.indexOf("PROMIS") > -1) {
            form.classification[0].elements.push(
                {
                    name: "PROMIS Instruments",
                    elements: [{
                        name: l2
                        , elements: []
                    }]
                }
            );
        } else {
            form.classification[0].elements.push(
                {
                    name: "Neuro-QOL Measures",
                    elements: [{
                        name: l2
                        , elements: []
                    }]
                }
            );
        }
        var currentSection = {
            elementType: "section",
            cardinality: "0.1",
            label: "___",
            formElements: []
        };
        pForm.content.Items = pForm.content.Items.sort(function (a, b) {
            return parseInt(a.Order) - parseInt(b.Order);
        });
        async.eachSeries(pForm.content.Items, function (item, oneDone) {
            var nameParts = [];
            item.Elements = item.Elements.sort(function (a, b) {
                return parseInt(a.ElementOrder) > parseInt(b.ElementOrder);
            });
            item.Elements.forEach(function (element) {
                if (!element.Map) {
                    nameParts.push(element.Description.trim());
                }
            });
            var newSectionName = nameParts.length > 1 ? nameParts[0] : "";
            if (newSectionName !== currentSection.label) {
                currentSection = {
                    elementType: "section",
                    cardinality: "0.1",
                    label: newSectionName,
                    formElements: []
                };
                form.formElements.push(currentSection);
            }
            mongo_cde.byOtherId(sourceName, item.ID, function (err, cde) {
                if (!cde) {
                    console.log("Unable to find CDE: " + nameParts);
                } else {
                    var question = {
                        answers: [],
                        cde: {
                            version: cde.version,
                            tinyId: cde.tinyId
                        },
                        unitsOfMeasure: []
                    };

                    if (cde.valueDomain.permissibleValues.length > 0) {
                        question.datatype = 'Value List';
                        question.answers = cde.valueDomain.permissibleValues.map(function (a) {
                            return a.toObject();
                        });
                        question.cde.permissibleValues = question.answers;
                    }

                    var qLabel = nameParts.length > 1 ? nameParts[1] : nameParts [0];
                    currentSection.formElements.push(
                        {
                            elementType: "question",
                            formElements: [],
                            cardinality: "0.1",
                            label: qLabel,
                            question: question
                        }
                    )
                }
                oneDone();
            });
        }, function allDone() {
            mongo_form.byOtherId(form.ids[0].source, form.ids[0].id, function (err, dupForm) {
                if (err) {
                    console.log("Unexpected duplicate form");
                    process.exit(1);
                }
                if (dupForm) {
                    dupForm.formElements = form.formElements;
                    dupForm.ids = form.ids;
                    dupForm.naming = form.naming;
                    dupForm.registrationState = form.registrationState;
                    updateShare.removeClassificationTree(dupForm, orgName);
                    dupForm.classification.push(form.classification[0]);
                    mongo_form.update(dupForm, user, function (err) {
                        console.log("Form Updated " + form.naming[0].designation);
                        if (err) {
                            console.log("unable to create FORM. " + err);
                            process.exit(1);
                        }
                        cb();
                    });
                } else {
                    mongo_form.create(form, user, function (err) {
                        console.log("Form Created " + form.naming[0].designation);
                        if (err) {
                            console.log("unable to create FORM. " + err);
                            process.exit(1);
                        }
                        cb();
                    });
                }

            });

        });
    });
};

var fakeTree = {};

console.log("reading directory:" + promisDir + "/forms" + date);

fs.readdir(promisDir + "/forms" + date, function (err, files) {
    if (err) {
        console.log("Cant read form dir." + err);
        process.exit(1);
    }

    mongo_data_system.orgByName(orgName, function (err, stewardOrg) {
        fakeTree = {elements: stewardOrg.classifications};
        var count = 1;
        async.eachSeries(files, function (file, cb) {
            console.log("next file. " + count++ + " / " + files.length);
            doFile(file, function () {
                stewardOrg.classifications = fakeTree.elements;
                stewardOrg.markModified("classifications");
                stewardOrg.save();
                loadForm(file, cb);
            });
        }, function allFilesDone() {
            mongo_cde.query({source: sourceName, updated: {$gte: twoDaysAgo}}, function (err, cdeArray) {
                loadLoincPv.loadPvs(cdeArray, function () {
                    console.log("lost forms\n\n\n");
                    lostForms.forEach(function (f) {
                        console.log(f)
                    });
                    process.exit(0);
                });
            });
        });
    });
});

