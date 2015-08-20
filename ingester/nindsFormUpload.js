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
conn.once('open', function callback() {
    console.log('connected to ' + mongoUri);
});

// Global variables
var globals = {
    orgName: "NINDS"
};

var Form = conn.model('Form', form_schemas.formSchema);
var DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);

var i = 0;
var doNextForm = function (result) {

    if (i === result.dataStructureExport.dataStructure.length) {
        process.exit();
    }

    var origFormElt = result.dataStructureExport.dataStructure[i];

    var newForm = new Form({
        tinyId: shortid.generate()
        ,
        created: Date.now()
        ,
        stewardOrg: {
            name: globals.orgName
        }
        ,
        registrationState: {
            registrationStatus: 'Qualified'
        }
        ,
        naming: [{
            designation: origFormElt.title[0],
            definition: origFormElt.description ? origFormElt.description[0] : ""
        }]
        ,
        formElements: [
            {
                elementType: "section"
                , label: "Main Section"
                , cardinality: "0.1"
                , formElements: []
            }
        ]
        ,
        classification: [
            {stewardOrg: {name: "NINDS"}, elements: [{name: "Disease", elements: []}]}
        ]
    });

    var j = 0;
    var doNextQuestion = function (elts) {
        if (j === elts.length) {
            // Add Classifications
            for (var h = 0; h < origFormElt.diseaseList[0].disease.length; h++) {
                newForm.classification[0].elements[0].elements.push({
                    name: origFormElt.diseaseList[0].disease[h].name[0]
                });
            }

            //  Copyright
            newForm.isCopyrighted = (origFormElt.isCopyrighted[0] == "true")

            newForm.save(function (err) {
                if (err) {
                    console.log("ERROR: " + err);
                    console.log("could not save: " + newForm.naming[0].designation);
                } else {
                    console.log("saved " + newForm.naming[0].designation);
                }
                i++;
                doNextForm(result);
            });
        } else {
            DataElement.find()
                .where("ids").elemMatch(function (elem) {
                    elem.where("source").equals("NINDS Variable Name").where("id").equals(elts[j].dataElement[0].name[0]);
                }).exec(function (err, result) {
                    if (result.length > 0) {
                        var question = {
                            elementType: "question"
                            , label: result[0].naming[0].designation
                            , cardinality: "0.1"
                            , question: {
                                cde: {tinyId: result[0].tinyId, version: "" + result[0].version, permissibleValues: []}
                                , datatype: result[0].valueDomain.datatype
                                , required: false
                                , uoms: []
                                , answers: []
                            }
                        };
                        if (result[0].valueDomain.uom) {
                            question.question.uoms.push(result[0].valueDomain.uom);
                        }
                        if (result[0].valueDomain.permissibleValues.length > 0) {
                            result[0].valueDomain.permissibleValues.forEach(function (pv) {
                                question.question.answers.push(pv);
                                question.question.cde.permissibleValues.push(pv);
                            });
                        }
                        newForm.formElements[0].formElements.push(question);
                    } else {
                        console.log("CDE: " + elt.dataElement[0].name[0] + " not found");
                    }
                    j++;
                    doNextQuestion(elts);
                });
        }
    };

    doNextQuestion(origFormElt.repeatableGroups[0].mapElements);
};

console.log("Parsing " + process.argv[2]);

fs.readFile(process.argv[2], function (err, data) {
    parser.parseString(data, function (err, result) {
        doNextForm(result);
    });
});
