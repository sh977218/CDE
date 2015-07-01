var fs = require('fs'),
    https = require('https'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    config = require('config'),
    classificationShared = require('../modules/system/shared/classificationShared'),
    mongo_data_system = require('../modules/system/node-js/mongo-data'),
    async = require ('async')
        ;

var promisDir = process.argv[2];
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
        var classifs = form.name.split(" - ");
        classificationShared.addCategory(fakeTree, [classifs[0], classifs[1], classifs[2]]);
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
            
            if (duplicate) {
                classificationShared.addCategory(duplicate.classification[0], [classifs[0], classifs[1], classifs[2]]);
            } else {
                cde.classification = [];    
                cde.classification.push({
                    stewardOrg : {
                        name : "Assessment Center"
                    },
                    elements : [ 
                        {
                            name : classifs[0],
                            elements : [ 
                                {
                                    name : classifs[1]
                                    , elements: [{name: classifs[2]}]
                                }
                            ]
                        }
                    ]                
                });
                cdeArray.cdearray.push(cde);
            }
        });
        cb();
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
        async.each(cdeArray.cdearray, function(cde, cb) {
            mongo_cde.create(cde, {username: 'loader'}, function(err, newCde) {
               if (err) {
                   console.log("unable to create CDE. " + err);
               }
               cb();
            });                        
        }, function(err) {
           process.exit(0); 
        });
    });    
});
});
}, 2000);


