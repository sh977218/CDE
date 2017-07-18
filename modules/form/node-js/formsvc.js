var mongo_form = require('./mongo-form')
    , mongo_data_system = require('../../system/node-js/mongo-data');

exports.byId = function (req, res) {
    let id = req.params.id;
    if (!id) res.status(500).send();
    else mongo_form.byId(id, function (err, form) {
        if (err) res.status(500).send(err);
        else {
            mongo_data_system.addToViewHistory(form, req.user);
            res.send(form);
        }
    });
};
exports.byTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    if (!tinyId) res.status(500).send();
    else mongo_form.byTinyId(tinyId, function (err, form) {
        if (err) res.status(500).send(err);
        else {
            mongo_data_system.addToViewHistory(form, req.user);
            res.send(form);
        }
    });
};

exports.versionById = function (req, res) {
    let id = req.params.id;
    mongo_form.versionById(id, function (err, form) {
        if (err) res.status(500).send();
        else res.send(form.version);
    });
};

exports.versionByTinyId = function (req, res) {
    let tinyId = req.params.tinyId;
    mongo_form.versionByTinyId(tinyId, function (err, form) {
        if (err) res.status(500).send();
        else res.send(form.version);
    });
};

exports.byTinyIdVersion = function (req, res) {
    let tinyId = req.params.tinyId;
    let version = req.params.version;
    mongo_form.byTinyIdVersion(tinyId, version, function (err, form) {
        if (err) res.status(500).send();
        else res.send(form);
    });
};

exports.priorForms = function (req, res) {
    let formId = req.params.id;
    if (!formId) return res.status(500).send();
    mongo_form.priorForms(formId, function (err, priorForms) {
        if (err) res.status(500).send();
        else res.send(priorForms);
    });
};