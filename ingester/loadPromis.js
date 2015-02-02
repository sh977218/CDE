var fs = require('fs'),
    https = require('https'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    config = require('config')
    ;

var promisDir = process.argv[2];
if (!promisDir) {
    console.log("missing promisDir arg");
    process.exit(1);
}

setTimeout(function() {
fs.readdir(promisDir + "/forms", function(err, files) {
    if (err) {
        console.log("Cant read form dir." + err);
        process.exit(1);
    }
    files.forEach(function(file) {
        console.log("file: " + file);
        fs.readFile(promisDir + "/forms/" + file, function(err, formData) {
            if (err) console.log("err " + err);
            var form = JSON.parse(formData);
            //each item is a CDE
            form.Items.forEach(function(item) {
                var cde = {
                    stewardOrg: {name: "PROMIS"},
                    source: "PROMIS",
                    naming: [
                        {designation: "", definition: "N/A"}
                    ],
                    ids: [{source: 'PROMIS', id: item.ID}],
                    valueDomain: {datatype: "Text"}
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
                mongo_cde.create(cde, {username: 'loader'}, function(err, newCde) {
                   if (err) {
                       console.log("unable to create CDE. " + err);
                   } else {
                       console.log("created cde");
                   }
                });
            });
        });
    });
});
}, 5000);