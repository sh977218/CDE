// 3) Loads PROMIS to DB
// node ingester/promis/loadPromis.js ../promis 2014-01

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

var date = process.argv[3];
if (!promisDir) {
    console.log("missing promisDir arg");
    process.exit(1);
}

var cdeArray = new function() {
    this.cdearray = [];
    this.findDuplicate = function(name) {
        var duplicates = this.cdearray.filter(function(cde){
            return cde.naming[0].designation === name;
        });
        if (duplicates.length > 0) return duplicates[0];
        else return false;
    };
};

var classifyEltNoDuplicate = function(form, cde, storeLastLevel){
    cde.classification = [];
    if (formClassifMap[form.name]) {
        classificationShared.addCategory(fakeTree, formClassifMap[form.name].concat([form.name]));
        if (formClassifMap[form.name].length === 2) {
            cde.classification.push({
                stewardOrg: {
                    name: "Assessment Center"
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
                    name: "Assessment Center"
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
                name: "Assessment Center"
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

var doFile = function(file, cb) {
    fs.readFile(promisDir + "/forms" + date + "/" + file, function(err, formData) {
        if (err) console.log("err " + err);
        var form = JSON.parse(formData);
        form.content.Items.forEach(function(item) {
            var cde = {
                stewardOrg: {name: "Assessment Center"},
                source: "Assessment Center",
                naming: [
                    {designation: "", definition: "N/A"}
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



            var duplicate = cdeArray.findDuplicate(cde.naming[0].designation);

            if (form.name === "PROMIS SF v2.0 - Instrumental Support 4a") {
                console.log("bad cde");
            }

            if (duplicate) {
                if (formClassifMap[form.name] && duplicate.classification[0]) {
                    classificationShared.addCategory(duplicate.classification[0], formClassifMap[form.name].concat(form.name));
                    classificationShared.addCategory(fakeTree, formClassifMap[form.name].concat(form.name));
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
                    classificationShared.addCategory(duplicate.classification[0], [c1, "Other", form.name]);

                }
            } else {
                classifyEltNoDuplicate(form, cde, true);
                cdeArray.cdearray.push(cde);
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
        });
        cb();
    });    
 };


var loadForm = function(file, cb) {
    fs.readFile(promisDir + "/forms" + date + "/" + file, function(err, formData) {
        if (err) console.log("err " + err);
        var pForm = JSON.parse(formData);

        if (formClassifMap[pForm.name]) classificationShared.addCategory(fakeTree, formClassifMap[pForm.name]);


        var form = {
            stewardOrg: {name: "Assessment Center"},
            source: "Assessment Center",
            naming: [
                {designation: pForm.name, definition: "N/A"}
            ],
            ids: [{source: 'Assessment Center', id: file.substr(0,36)}],
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
                    name: "Assessment Center"
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
            if (pForm.name.indexOf("Ped Bank")>-1) l2 = "Pediatric Banks";
            else if (pForm.name.indexOf("Ped SF")>-1) l2 = "Pediatric Short Forms";
            else if (pForm.name.indexOf("Bank")>-1) l2 = "Adult Banks";
            else if (pForm.name.indexOf("SF")>-1) l2 = "Adult Short Forms";
            else l2 = "Other";
            form.classification.push({
                stewardOrg: {
                    name: "Assessment Center"
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

        pForm.content.Items.forEach(function(item){
            console.log(item.Order);
        });

        pForm.content.Items = pForm.content.Items.sort(function(a,b){
            return parseInt(a.Order) > parseInt(b.Order);
        });

        pForm.content.Items.forEach(function(item, index) {
            var nameParts = [];

            item.Elements = item.Elements.sort(function(a,b){
                return parseInt(a.ElementOrder) > parseInt(b.ElementOrder);
            });

            item.Elements.forEach(function(element) {
                if (!element.Map) {
                    nameParts.push(element.Description.trim());
                }
            });

            var newSectionName = nameParts.length > 1? nameParts[0] : "Section";

            if (newSectionName !== currentSection.label) {
                currentSection = {
                    elementType: "section",
                    cardinality: "0.1",
                    label: newSectionName,
                    formElements: []
                };
                form.formElements.push(currentSection);
            }
            var cde = cdeArray.findDuplicate(nameParts.join(" "));

            if (!cde) {
                console.log("Unable to find CDE: " + cde.naming[0].designation);
                process.exit(1);
            } else {
                var question = {
                    answers: [],
                    cde: {
                        version: cde.version,
                        tinyId: cde.tinyId
                    },
                    uoms: [],
                    otherPleaseSpecify: false
                };

                if (cde.valueDomain.permissibleValues.length > 0) {
                    question.datatype = 'Value List';
                    question.answers = cde.valueDomain.permissibleValues.slice(0);
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
        });
        mongo_form.create(form, {username: 'loader'}, function(err, newForm) {
            if (err) {
                console.log("unable to create FORM. " + err);
                process.exit(1);
            }
            cb();
        });
    });
};


var fakeTree = {};

setTimeout(function() {

    console.log("reading directory:" + promisDir + "/forms"+date);

fs.readdir(promisDir + "/forms"+date, function(err, files) {
    if (err) {
        console.log("Cant read form dir." + err);
        process.exit(1);
    }
    
mongo_data_system.orgByName("Assessment Center", function(stewardOrg) {
    fakeTree = {elements: stewardOrg.classifications};
    async.each(files, function(file, cb){
        doFile(file, function(){
            cb();
        });
    }, function(err){
        stewardOrg.classifications = fakeTree.elements;
        stewardOrg.markModified("classifications");
        stewardOrg.save(function (err) {
        });
        var newCdeArray = [];
        async.each(cdeArray.cdearray, function(cde, cb) {
            mongo_cde.create(cde, {username: 'loader'}, function(err, newCde) {
               if (err) {
                   console.log("unable to create CDE. " + err);
               }
               newCdeArray.push(newCde);
               cb();
            });                        
        }, function(err) {

            mongo_cde.query({source: "Assessment Center"}, function(err, cdes){
                cdeArray.cdearray = cdes;
                async.each(files, function(file, cb){
                    loadForm(file, function(){
                        cb();
                    });
                }, function(err) {
                    loadLoincPv.loadPvs(cdeArray, function() {
                        console.log("lost forms\n\n\n");
                        lostForms.forEach(function(f){console.log(f)});
                        process.exit(0);
                    });
                });
            });

        });
    });    
});
});
}, 2000);


