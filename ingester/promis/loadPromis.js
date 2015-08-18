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
    //loinc = require('../../'+promisDir + '/loinc.json'),
    loinc = JSON.parse(fs.readFileSync(promisDir + '/loinc.json')),
    loadLoincPv = require('./loadLoincPVs'),
    formClassifMap = JSON.parse(fs.readFileSync(promisDir + '/formMap.json'))
    //formClassifMap = require('../../'+promisDir + '/formMap.json')
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

var doFile = function(file, cb) {
    fs.readFile(promisDir + "/forms" + date + "/" + file, function(err, formData) {
        if (err) console.log("err " + err);
        var form = JSON.parse(formData);
        //each item is a CDE
        //console.log("Form: " + form.name);
        //var classifs = form.name.split(" - ");
        //classificationShared.addCategory(fakeTree, [classifs[0], classifs[1], classifs[2]]);
        //if (formClassifMap[form.name]) classificationShared.addCategory(fakeTree, formClassifMap[form.name]);
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

            //var lastNamePart = item.Elements[item.Elements.length-1];
            //if (lastNamePart[lastNamePart.length-1]===".") item.Elements[items.Elements.length-1] = lastNamePart.substr(0,lastNamePart.length -2);
            //console.log("corrected name: "+item.Elements[items.Elements.length-1]);

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
                    //lostForms.push(form.name);

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
                                            , elements: [{
                                                name: form.name
                                                , elements: []
                                            }]
                                        }
                                    ]
                                }
                            ]
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
                                                name:  formClassifMap[form.name][2]
                                                , elements: [{
                                                    name: form.name
                                                    , elements: []
                                                }]
                                            }]
                                        }
                                    ]
                                }
                            ]
                        });
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
            //if (!found) console.log("can't find ID: " + cde.naming[0].designation);
        });
        cb();
    });    
 };


var loadForm = function(file, cb) {
    fs.readFile(promisDir + "/forms" + date + "/" + file, function(err, formData) {
        if (err) console.log("err " + err);
        var pForm = JSON.parse(formData);
        //each item is a CDE
        //console.log("Form: " + pForm.name);
        //var classifs = pForm.name.split(" - ");
        if (formClassifMap[pForm.name]) classificationShared.addCategory(fakeTree, formClassifMap[pForm.name]);


        var form = {
            stewardOrg: {name: "Assessment Center"},
            source: "Assessment Center",
            naming: [
                {designation: pForm.name, definition: "N/A"}
            ],
            ids: [{source: 'Assessment Center', id: pForm.OID}],
            registrationState: {registrationStatus: "Qualified"},
            formElements: [],
            classification: [
                {
                    stewardOrg : {
                        name : "Assessment Center"
                    },
                    elements : []
                }]
        };
        if (formClassifMap[pForm.name]) {
            form.classification[0].elements.push({
                name : formClassifMap[pForm.name][0],
                elements : [{
                    name : formClassifMap[pForm.name][1]
                    , elements: []
                }]
            });
            if (formClassifMap[pForm.name].length>2) {
                form.classification[0].elements[0].elements[0].elements.push({
                    name: formClassifMap[pForm.name][2]
                    , elements: []
                });
            }
        }

        var currentSection = {
            elementType: "section",
            cardinality: "0.1",
            label: "___",
            formElements: []
        };
        pForm.content.Items.forEach(function(item) {
            var nameParts = [];
            item.Elements.forEach(function(element) {
                if (!element.Map) {
                    nameParts.push(element.Description.trim());
                }
            });

            var newSectionName = nameParts.length > 1? nameParts[0] : "Main Section";

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
            //// Get this from MongoDB!!
            //cdeArray.cdearray = newCdeArray;
            //// Now load the forms
            //async.each(files, function(file, cb){
            //    loadForm(file, function(){
            //        cb();
            //    });
            //}, function(err) {
            //    loadLoincPv.loadPvs(cdeArray, function() {
            //        console.log("lost forms\n\n\n");
            //        lostForms.forEach(function(f){console.log(f)});
            //        process.exit(0);
            //    });
            //});

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


