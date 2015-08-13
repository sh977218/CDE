var fs = require('fs'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    mongo_data_system = require('../modules/system/node-js/mongo-data');
var forms;

setTimeout(function () {
    fs.readFile(__dirname + '/nindsForms.json', 'utf8', function (err, data) {
        if (err) throw err;
        forms = JSON.parse(data);
        forms.forEach(function (form) {
            form.cdes.forEach(function (cde) {
                mongo_cde.byOtherId("NINDS", cde, function (err, cdeFound) {
                    var formElement = new Schema(mongo_data_system.formElementTreeRoot, {_id: false});
                    formElement.question.cde.tinyId = cdeFound.tinyId;
                    formElement.question.cde.version = cde.version;
                    form.formElements.push(formElement);
                })
            })
            delete form.cdes;
        })
    });
}, 3000);

