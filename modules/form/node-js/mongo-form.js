var mongoose = require('mongoose')
    , config = require('../../system/node-js/parseConfig')
    , schemas = require('./schemas')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , mongo_cde = require('../../cde/node-js/mongo-cde')
    , connHelper = require('../../system/node-js/connections')
    , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
    ;

exports.type = "form";
exports.name = "forms";

var conn = connHelper.establishConnection(config.database.appData);
var Form = conn.model('Form', schemas.formSchema);

exports.Form = Form;

exports.idExists = function (id, callback) {
    Form.count({_id: id}).count().then(function (result) {
        callback(result === 0);
    });
};

exports.priorForms = function (formId, callback) {
    Form.findById(formId).exec(function (err, form) {
        if (form !== null) {
            return Form.find({}, "updated updatedBy changeNote")
                .where("_id").in(form.history).exec(function (err, forms) {
                    callback(err, forms);
                });
        } else {
        }
    });
};


exports.findForms = function (request, callback) {
    var criteria = {};
    if (request && request.term) {
        criteria = {
            "naming.designation": new RegExp(request.term)
        };
    }
    Form.find(criteria).where("archived").equals(null).exec(callback);
};

exports.update = function (elt, user, callback, special) {
    if (elt.toObject) elt = elt.toObject();
    return Form.findOne({_id: elt._id}).exec(function (err, form) {
        delete elt._id;
        if (!elt.history)
            elt.history = [];
        elt.history.push(form._id);
        elt.updated = new Date().toJSON();
        elt.updatedBy = {};
        elt.updatedBy.userId = user._id;
        elt.updatedBy.username = user.username;

        elt.comments = form.comments;
        var newForm = new Form(elt);
        form.archived = true;
        if (special) {
            special(form, form);
        }
        if (newForm.naming.length < 1) {
            logging.errorLogger.error("Error: Cannot save form without names", {
                origin: "cde.mongo-form.update.1",
                stack: new Error().stack,
                details: "elt " + JSON.stringify(elt)
            });
            callback("Cannot save form without names");
        }

        newForm.save(function (err) {
            if (err) {
                logging.errorLogger.error("Error: Cannot save form", {
                    origin: "cde.mongo-form.update.2",
                    stack: new Error().stack,
                    details: "err " + err
                });
                callback(err);
            } else {
                form.save(function (err) {
                    if (err) {
                        logging.errorLogger.error("Error: Cannot save form", {
                            origin: "cde.mongo-form.update.3",
                            stack: new Error().stack,
                            details: "err " + err
                        });
                    }
                    callback(err, newForm);
                    //mongo_cde.saveModification(form, newForm, user);
                });
            }
        });
    });
};

exports.create = function (form, user, callback) {
    var newForm = new Form(form);
    if (!form.registrationState) {
        newForm.registrationState = {
            registrationStatus: "Incomplete"
        };
    }
    newForm.created = Date.now();
    newForm.tinyId = mongo_data_system.generateTinyId();
    newForm.createdBy = {
        userId: user._id
        , username: user.username
    };
    newForm.save(function (err) {
        callback(err, newForm);
    });
};

exports.byId = function (id, callback) {
    Form.findById(id, callback);
};

exports.userTotalSpace = function (name, callback) {
    mongo_data_system.userTotalSpace(Form, name, callback);
};

exports.query = function (query, callback) {
    Form.find(query).exec(callback);
};

exports.allPropertiesKeys = function (callback) {
    Form.distinct("properties.key").exec(callback);
};

exports.transferSteward = function (from, to, callback) {
    Form.update({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}, {multi: true}).exec(function (err, result) {
        callback(err, result.nModified);
    });
};

exports.byTinyIdAndVersion = function (tinyId, version, callback) {
    Form.findOne({'tinyId': tinyId, "version": version}).exec(function (err, elt) {
        callback("", elt);
    });
};

exports.eltByTinyId = function (tinyId, callback) {
    if (!tinyId) callback("tinyId is undefined!", null);
    if (tinyId.length > 20) Form.findOne({'_id': tinyId}).exec(callback);
    else Form.findOne({'tinyId': tinyId, "archived": null}).exec(callback);
};

exports.removeAttachmentLinks = function (id) {
    adminItemSvc.removeAttachmentLinks(id, Form);
};

exports.setAttachmentApproved = function (id) {
    adminItemSvc.setAttachmentApproved(id, Form);
};

exports.fileUsed = function (id, cb) {
    adminItemSvc.fileUsed(id, Form, cb);
};