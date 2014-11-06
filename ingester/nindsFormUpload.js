var fs = require('fs')
    , util = require('util')
    , xml2js = require('xml2js')
    , mongoose = require('mongoose')
    , shortid = require('shortid')
    , config = require('config')
    , form_schemas = require('../modules/form/node-js/schemas')
    , cde_schemas = require('../modules/cde/node-js/schemas')
    , async = require('async')
;

var MongoClient = require('mongodb').MongoClient;
var parser = new xml2js.Parser();

var mongoUri = config.mongoUri;

var conn = mongoose.createConnection(mongoUri);
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function callback () {

    console.log('mongodb connection open');
    

});    

// Global variables
var globals = {
    orgName : "NINDS"
};

var Form = conn.model('Form', form_schemas.formSchema);
var DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);

var i = 0;
var doNext = function(result) {
    
    if (i === result.dataStructureExport.dataStructure.length) {
        process.exit();
    }
    
    var origFormElt = result.dataStructureExport.dataStructure[i];

    var newForm = new Form({
        tinyId: shortid.generate()
        , created: Date.now()
        , stewardOrg: {
            name: globals.orgName
        }
        , registrationState: {
            registrationStatus: 'Qualified'
        }
        , naming: [{designation: origFormElt.title[0], definition: origFormElt.description?origFormElt.description[0]:""}]
        , formElements: [
            {
                elementType: "section"
                , label: "Main Section"
                , cardinality: "0.1"
                , formElements: []
            }
        ]
    });

    async.each(origFormElt.repeatableGroups[0].mapElements,
        function(elt, cb){
            DataElement.find()
                .where("properties").elemMatch(function(elem) {
                    elem.where("key").equals("NINDS Variable Name").where("value").equals(new RegExp("^" + elt.dataElement[0].name[0]));
                })
                .exec(function(err, result) {
                    if (result.length > 0) {
                        newForm.formElements[0].formElements.push({
                            elementType: "question"
                            , label: result[0].naming[0].designation
                            , cardinality: "0.1"
                        });
                    } else {
                        console.log("CDE: " + elt.dataElement[0].name[0] + " not found");
                    }
                    cb();
                });
        },
        function(err){
            if (err) {
                console.log("ERROR: " + err);
                console.log("not saving: " + newForm.naming[0].designation);
            } else {
                newForm.save(function(err) {
                    if (err) {
                        console.log("ERROR: " + err);
                        console.log("could not save: " + newForm.naming[0].designation);
                    } else {
                        console.log("saved " + newForm.naming[0].designation)
                    }
                    i++;
                    doNext(result);
                });                    
            }
        }
    );

}

fs.readFile(process.argv[2], function(err, data) {
    parser.parseString(data, function (err, result) {
//        for (var i = 0; i < result.dataStructureExport.dataStructure.length; i++) {
//        for (var i = 0; i < 2; i++) {
          doNext(result);  
    });
});
 
    

//setTimeout((function() {
//    console.log("Done");
//    process.exit();
//}), 30000);
//
