var util = require('util'),
    mongo_data = require('./mongo-form');

exports.priorForms = function (req, res) {
    var formId = req.params.id;

    if (!formId) {
        res.send("No Form Id");
    }
    mongo_data.priorForms(formId, function (err, priorForms) {
        if (err) {
            res.send("ERROR");
        } else {
            res.send(priorForms);
        }
    });
};