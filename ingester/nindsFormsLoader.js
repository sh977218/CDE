var fs = require('fs'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    mongo_form = require('../modules/form/node-js/mongo-form'),
    mongo_data_system = require('../modules/system/node-js/mongo-data'),
    async = require('async');
var forms;
var user = {
    "username": "batchloader"
};

setTimeout(function () {
    fs.readFile(__dirname + '/nindsForms.json', 'utf8', function (err, data) {
        if (err) throw err;
        forms = JSON.parse(data);
        async.eachSeries(forms, function (form, formCallback) {
            async.eachSeries(form.cdes, function (cde, cdeCallback) {
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
            }, function doneAllCdes() {
                delete form.cdes;
                saveForm(form, user, formCallback);
                console.log("done this form's all cdes.");
            });

        }, function doneAllForm() {
            console.log("finished all forms.");
        })
    })
}, 3000);

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
        formCallback();
    })
}
