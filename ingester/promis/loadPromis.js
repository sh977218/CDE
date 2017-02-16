// 4) Loads PROMIS to DB
// node ingester/promis/loadPromis.js ../promis 2014-01

// @TODO replace AAssessment center

var promisDir = process.argv[2];

var fs = require('fs'),
    https = require('https'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    mongo_form = require('../../modules/form/node-js/mongo-form'),
    config = require('config'),
    classificationShared = require('../../modules/system/shared/classificationShared'),
    mongo_data_system = require('../../modules/system/node-js/mongo-data'),
    async = require ('async'),
    loinc = JSON.parse(fs.readFileSync(promisDir + '/loinc.json')),
    loadLoincPv = require('./loadLoincPVs'),
    formClassifMap = JSON.parse(fs.readFileSync(promisDir + '/formMap.json'))
    ;

var lostForms = [];

var user = {username: 'batchloader'};

var date = process.argv[3];
if (!promisDir) {
    console.log("missing promisDir arg");
    process.exit(1);
}

var classifyEltNoDuplicate = function(form, cde, storeLastLevel) {
    cde.classification = [];
    if (formClassifMap[form.name]) {
        classificationShared.addCategory(fakeTree, formClassifMap[form.name].concat([form.name]));
        if (formClassifMap[form.name].length === 2) {
            cde.classification.push({
                stewardOrg: {
                    name: "PROMIS / Neuro-QOL"
                },
                elements: [
                    {
                        name: formClassifMap[form.name][0],
                        elements: [
                            {
                                name: formClassifMap[form.name][1]
                                , elements: []
                            }
                        ]
                    }
                ]
            });
            if (storeLastLevel) cde.classification[0].elements[0].elements[0].elements.push({
                name: form.name
                , elements: []
            });
        }
        else if (formClassifMap[form.name].length>2) {
            cde.classification.push({
                stewardOrg: {
                    name: "PROMIS / Neuro-QOL"
                },
                elements: [
                    {
                        name: formClassifMap[form.name][0],
                        elements: [
                            {
                                name: formClassifMap[form.name][1]
                                , elements: [{
                                    name: formClassifMap[form.name][2]
                                    , elements: []
                                }]
                            }
                        ]
                    }
                ]
            });
            if (storeLastLevel) {
                cde.classification[0].elements[0].elements[0].elements[0].elements.push({
                    name: form.name
                    , elements: []
                });
            }
        }
    }
    else {
        var c1;
        if (form.name.indexOf("Neuro-QOL")>-1) {
            c1 = "Neuro-QOL Measures";
        } else if (form.name.indexOf("PROMIS")>-1) {
            c1 = "PROMIS Instruments";
        } else {
            c1 = "Other";
        }
        classificationShared.addCategory(fakeTree, [c1, "Other", form.name]);
        cde.classification.push({
            stewardOrg: {
                name: "PROMIS / Neuro-QOL"
            },
            elements: [
                {
                    name: c1,
                    elements: [{
                        name: "Other"
                        , elements: [{
                            name: form.name
                            , elements: []
                        }]
                    }]
                }
            ]
        });
    }
};

var ignoreTerms = ["Neuro-QoL", "Banco", "Capacidad", "Comportamiento", "Ansiedad",
    "Depresión", "Intensidad", "Agotamiento", "Alteraciones", "Sentimentios", "Satisfacción",
    "Bank"];

var doFile = function(file, cb) {
    fs.readFile(promisDir + "/forms" + date + "/" + file, function(err, formData) {
        if (err) console.log("err in file: " + file + "\n" + err);
        var form = JSON.parse(formData);
        var isSpanish = false;
        ignoreTerms.forEach(t => {
            if (form.name.indexOf(t) > 0) {
                isSpanish = true;
            }
        });
        if (isSpanish) {
            console.log("skip spanish form: " + form.name);
            return cb();
        }
        async.eachSeries(form.content.Items, function(item, oneDone) {
            var cde = {
                stewardOrg: {name: "PROMIS / Neuro-QOL"},
                source: "AAssessment Center",
                naming: [
                    {designation: "", definition: "N/A", tags: []}
                ],
                ids: [{source: 'Assessment Center', id: item.ID}],
                valueDomain: {datatype: "Text"},
                registrationState: {registrationStatus: "Qualified"}
            };
            item.Elements.forEach(function(element) {
                if (!element.Map) {
                    cde.naming[0].designation = cde.naming[0].designation + " " + element.Description;
                    cde.naming[0].designation = cde.naming[0].designation.trim();
                } else {
                    if (cde.valueDomain.datatype !== 'Value List') {
                        cde.valueDomain.datatype = 'Value List';
                        cde.valueDomain.permissibleValues = [];
                    }
                    element.Map.forEach(function(map) {
                        cde.valueDomain.permissibleValues.push({permissibleValue: map.Value, valueMeaningName: map.Description});                         
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
            loinc.forEach(function(l){
                var processString = function(str){
                    return str.toLowerCase().replace(/[^A-z]/g,"");
                };
                var loincName = processString(l.name);
                var loincName2 = processString(l.name2);
                var cdeName = processString(cde.naming[0].designation);
                if (loincName === cdeName || loincName2 === cdeName || cde.ids[0].id === l.sourceId) {
                    if (found) console.log("ID found twice: " + cdeName);
                    cde.ids.push({source:"LOINC", id: l.loincCode});
                    found = true;
                }
            });
            mongo_cde.byOtherId("Assessment Center", item.ID, function (err, duplicate) {
                if (err) {
                    console.log("Unexpected Duplicate CDE: " + item.ID);
                    process.exit(1);
                }
                if (duplicate) {
                    if (formClassifMap[form.name] && duplicate.classification[0]) {
                        classificationShared.addCategory(duplicate.classification[0], formClassifMap[form.name].concat(form.name));
                        classificationShared.addCategory(fakeTree, formClassifMap[form.name].concat(form.name));
                    }
                    else {
                        var c1;
                        if (form.name.indexOf("Neuro-QOL") > -1) {
                            c1 = "Neuro-QOL Measures";
                        } else if (form.name.indexOf("PROMIS") > -1) {
                            c1 = "PROMIS Instruments";
                        } else {
                            c1 = "Other";
                        }
                        classificationShared.addCategory(fakeTree, [c1, "Other", form.name]);
                        classificationShared.addCategory(duplicate.classification[0], [c1, "Other", form.name]);
                    }
                    //  @TODO should use update and figure out how to.
                    mongo_cde.save(duplicate, oneDone);
                } else {
                    classifyEltNoDuplicate(form, cde, true);
                    mongo_cde.create(cde, user, oneDone);
                }
            });
        }, cb);
    });
 };

var loadForm = function(file, cb) {
    fs.readFile(promisDir + "/forms" + date + "/" + file, function(err, formData) {
        if (err) console.log("err " + err);
        var pForm = JSON.parse(formData);

        var isSpanish = false;
        spanishTerms.forEach(t => {
            if (pForm.name.indexOf(t) > 0) {
                isSpanish = true;
            }
        });
        if (isSpanish) {
            return cb();
        }

        if (formClassifMap[pForm.name]) classificationShared.addCategory(fakeTree, formClassifMap[pForm.name]);

        var form = {
            stewardOrg: {name: "PROMIS / Neuro-QOL"},
            source: "AAssessment Center",
            naming: [
                {designation: pForm.name, definition: "N/A"}
            ],
            ids: [{source: 'Assessment Center', id: file.substr(0, 36)}],
            registrationState: {registrationStatus: "Qualified"},
            formElements: [],
            classification: []
            , isCopyrighted: true
            , copyright: {
                authority: "PROMIS Health Organization"
            }
        };
        if (formClassifMap[pForm.name]) {
            classifyEltNoDuplicate(pForm, form);
        } else if (pForm.name.indexOf("PROMIS") > -1) {
            form.classification.push({
                stewardOrg: {
                    name: "PROMIS / Neuro-QOL"
                },
                elements: [
                    {
                        name: "PROMIS Instruments",
                        elements: [{
                            name: "Other"
                            , elements: []
                        }]
                    }
                ]
            });
        } else {
            var l2;
            if (pForm.name.indexOf("Ped Bank") > -1) l2 = "Pediatric Banks";
            else if (pForm.name.indexOf("Ped SF") > -1) l2 = "Pediatric Short Forms";
            else if (pForm.name.indexOf("Bank") > -1) l2 = "Adult Banks";
            else if (pForm.name.indexOf("SF") > -1) l2 = "Adult Short Forms";
            else l2 = "Other";
            form.classification.push({
                stewardOrg: {
                    name: "PROMIS / Neuro-QOL"
                },
                elements: [
                    {
                        name: "Neuro-QOL Measures",
                        elements: [{
                            name: l2
                            , elements: []
                        }]
                    }
                ]
            });
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
            var newSectionName = nameParts.length > 1 ? nameParts[0] : "Section";
            if (newSectionName !== currentSection.label) {
                currentSection = {
                    elementType: "section",
                    cardinality: "0.1",
                    label: newSectionName,
                    formElements: []
                };
                form.formElements.push(currentSection);
            }
            mongo_cde.byOtherId("Assessment Center", item.ID, function (err, cde) {
                if (!cde) {
                    console.log("Unable to find CDE: " + nameParts);
                } else {
                    var question = {
                        answers: [],
                        cde: {
                            version: cde.version,
                            tinyId: cde.tinyId
                        },
                        uoms: []
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
                    // @TODO do something here and cb()

                } else {
                    mongo_form.create(form, {username: 'loader'}, function (err) {
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

console.log("reading directory:" + promisDir + "/forms"+date);

fs.readdir(promisDir + "/forms"+date, function(err, files) {
    if (err) {
        console.log("Cant read form dir." + err);
        process.exit(1);
    }

    mongo_data_system.orgByName("PROMIS / Neuro-QOL", function(stewardOrg) {
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
            mongo_cde.query({source: "AAssessment Center"}, function (err, cdeArray) {
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

