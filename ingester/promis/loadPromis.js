var promisDir = process.argv[2];

var fs = require('fs'),
    https = require('https'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    mongo_form = require('../../modules/form/node-js/mongo-form'),
    config = require('config'),
    classificationShared = require('../../modules/system/shared/classificationShared'),
    mongo_data_system = require('../../modules/system/node-js/mongo-data'),
    async = require ('async'),
    loinc = require('../../'+promisDir + '/loinc.json'),
    loadLoincPv = require('./loadLoincPVs')
    ;


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
        console.log("Form: " + form.name);
        //var classifs = form.name.split(" - ");
        //classificationShared.addCategory(fakeTree, [classifs[0], classifs[1], classifs[2]]);
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
            
            if (duplicate) {
                //classificationShared.addCategory(duplicate.classification[0], [classifs[0], classifs[1], classifs[2]]);
            } else {
                cde.classification = [];
                cde.classification.push({
                        stewardOrg : {
                            name : "Assessment Center"
                        },
                        elements : [
                            {
                                name: "temp",
                                elements: []
                            }
                        ]
                });
                //cde.classification.push({
                //    stewardOrg : {
                //        name : "Assessment Center"
                //    },
                //    elements : [
                //        {
                //            name : classifs[0],
                //            elements : [
                //                {
                //                    name : classifs[1]
                //                    , elements: [{name: classifs[2]}]
                //                }
                //            ]
                //        }
                //    ]
                //});
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
            if (!found) console.log("can't find ID: " + cde.naming[0].designation);
        });
        cb();
    });    
 };


var loadForm = function(file, cb) {
    fs.readFile(promisDir + "/forms" + date + "/" + file, function(err, formData) {
        if (err) console.log("err " + err);
        var pForm = JSON.parse(formData);
        //each item is a CDE
        console.log("Form: " + pForm.name);
        //var classifs = pForm.name.split(" - ");
        //classificationShared.addCategory(fakeTree, [classifs[0], classifs[1]]);


        var form = {
            stewardOrg: {name: "Assessment Center"},
            source: "Assessment Center",
            naming: [
                {designation: pForm.name, definition: "N/A"}
            ],
            ids: [{source: 'Assessment Center', id: pForm.OID}],
            registrationState: {registrationStatus: "Qualified"},
            formElements: [{
                elementType: "section",
                cardinality: "0.1",
                label: "Main Section",
                formElements: []
            }],
            //classification: [
            //    {
            //        stewardOrg : {
            //            name : "Assessment Center"
            //        },
            //        elements : [{
            //            name : classifs[0],
            //            elements : [
            //                {
            //                    name : classifs[1]
            //                    , elements: []
            //                }]
            //        }]
            //    }]
        };

        pForm.content.Items.forEach(function(item) {
            var cdeName = "";
            item.Elements.forEach(function(element) {
                if (!element.Map) {
                    cdeName = cdeName + " " + element.Description;
                    cdeName = cdeName.trim();
                }
            });

            var cde = cdeArray.findDuplicate(cdeName);

            if (!cde) {
                console.log("Unable to find CDE: " + cde.naming[0].designation);
                process.exit(1);
            } else {
                form.formElements[0].formElements.push(
                    {
                        elementType: "question",
                        formElements: [],
                        cardinality: "0.1",
                        label: cdeName,
                        question: {
                            answers: [],
                            cde: {
                                version: cde.version,
                                tinyId: cde.tinyId
                            },
                            uoms: [],
                            otherPleaseSpecify: false
                        }
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
    console.log("FAKETREE: ");
    console.log(fakeTree);
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
            cdeArray.cdearray = newCdeArray;
            // Now load the forms
            async.each(files, function(file, cb){
                loadForm(file, function(){
                    cb();
                });
            }, function(err) {
                loadLoincPv.loadPvs(cdeArray, function() {
                    process.exit(0);
                });
            });
        });
    });    
});
});
}, 2000);


