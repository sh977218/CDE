var fs = require('fs'),
    mongoose = require('mongoose'),
    config = require('config'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    mongo_form = require('../modules/form/node-js/mongo-form'),
    form_schemas = require('../modules/form/node-js/schemas'),
    mongo_data_system = require('../modules/system/node-js/mongo-data'),
    async = require('async');


var MongoClient = require('mongodb').MongoClient;
var conn = mongoose.createConnection("mongodb://siteRootAdmin:password@localhost:27017/test", {auth: {authdb: "admin"}});
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function callback() {
    console.log('connected to db');
});

// Global variables
var globals = {
    orgName: "NINDS"
};

var Form = conn.model('Form', form_schemas.formSchema);

var oldForms;
var user = {
    "username": "batchloader"
};

setTimeout(function () {
        fs.readFile(__dirname + '/nindsForms.json', 'utf8', function (err, data) {
            if (err) throw err;
            var newForms = [];
            oldForms = JSON.parse(data);
            async.eachSeries(oldForms, function (oldForm, formCallback) {
                var newForm = new Form({
                    stewardOrg: {
                        name: globals.orgName
                    },
                    naming: [{
                        designation: oldForm.crfModuleGuideline,
                        definition: oldForm.description
                    }],
                    formElements: [{
                        elementType: "section",
                        label: "Main Section",
                        cardinality: "0.1",
                        formElements: []
                    }],
                    classification: [{
                        stewardOrg: {name: "NINDS"},
                        elements: [{
                            name: "Disease",
                            elements: []
                        }]
                    }]
                });
                newForms.push(newForm);
                var i = oldForms.indexOf(oldForm) + 1;
                console.log("oldForm " + i + " saved.");
                formCallback();
            }, function doneAllForm() {
                console.log("finished all forms.");
                fs.write("../ingester/newForms.json", JSON.stringify(newForms, null, 4), function (err) {
                    if (err) console.log(err);
                    else console.log("finish saving new forms");
                })
            })
        })
    },
    3000
)
;

/*
 var saveForm = function (form, user, formCallback) {
 mongo_form.create(form, user, function (err, newForm) {
 if (err) {
 console.log(err);
 throw err;
 }
 else {
 var i = forms.indexOf(form) + 1;
 console.log("form " + i + " saved.");
 }
 })
 }


 async.eachSeries(form.cdes, function (cde, cdeCallback) {
 }, function doneAllCdes() {
 delete form.cdes;
 saveForm(form, user, formCallback);
 console.log("done this form's all cdes.");
 });

 mongo_cde.byOtherId("NINDS", cde, function (err, data) {
 if (data != null && data != undefined && data.hasOwnProperty("_doc")) {
 var cdeFound = data['_doc'];
 if (cdeFound.hasOwnProperty("tinyId") && cdeFound.hasOwnProperty("version")) {
 var formElement = {
 question: {
 cde: {
 tinyId: "",
 version: "",
 permissibleValues: []
 }
 }
 };
 formElement.question.cde.tinyId = cdeFound.tinyId;
 formElement.question.cde.version = cdeFound.version;
 formElement.question.cde.permissibleValues = cdeFound.valueDomain.permissibleValues;
 form.formElements.push(formElement);
 }
 }
 cdeCallback();
 });

 */