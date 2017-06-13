var mongo_form = require('./mongo-form');

exports.priorForms = function (req, res) {
    var formId = req.params.id;

    if (!formId) {
        res.send("No Data Element Id");
    }
    mongo_form.priorForms(formId, function (err, priorForms) {
        if (err) {
            res.send("ERROR");
        } else {
            res.send(priorForms);
        }
    });
};