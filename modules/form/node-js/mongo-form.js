const async = require('async');
const config = require('../../system/node-js/parseConfig');
const schemas = require('./schemas');
const mongo_data_system = require('../../system/node-js/mongo-data');
const connHelper = require('../../system/node-js/connections');
const logging = require('../../system/node-js/logging');
const elastic = require('./elastic');
const mongo_cde = require('../../cde/node-js/mongo-cde');

exports.type = "form";
exports.name = "forms";

var conn = connHelper.establishConnection(config.database.appData);

schemas.formSchema.pre('save', function (next) {
    var self = this;
    try {
        elastic.updateOrInsert(self);
    } catch (exception) {
        logging.errorLogger.error(exception);
    }
    next();
});

var Form = conn.model('Form', schemas.formSchema);
exports.Form = Form;

exports.elastic = elastic;

function fetchWholeForm(form, callback) {
    let formOutdated = false;
    let maxDepth = 8;
    let depth = 0;
    let loopFormElements = function (f, cb) {
        if (!f) return cb();
        if (!f.formElements) f.formElements = [];
        async.forEachSeries(f.formElements, function (fe, doneOne) {
            if (fe.elementType === "form") {
                depth++;
                if (depth < maxDepth)
                    Form.findOne({
                        tinyId: fe.inForm.form.tinyId,
                        version: fe.inForm.form.version
                    }, function (err, result) {
                        if (err)
                            return cb("Retrieving form tinyId: " + fe.inForm.form.tinyId + " version: " + fe.inForm.form.version + " has error: " + err);
                        result = result.toObject();
                        fe.formElements = result.formElements;
                        loopFormElements(fe, function () {
                            depth--;
                            doneOne();
                        });
                    });
                else doneOne();
            } else if (fe.elementType === "section") {
                loopFormElements(fe, function () {
                    doneOne();
                });
            } else {
                let tinyId = fe.question.cde.tinyId;
                let version = fe.question.cde.version;
                mongo_cde.byTinyId(tinyId, function (err, dataElement) {
                    if (err || !dataElement) cb(err);
                    else {
                        let de = dataElement.toObject();
                        if (version !== de.version) {
                            fe.question.cde.outdated = true;
                            formOutdated = true;
                        }
                        fe.question.cde.derivationRules = de.derivationRules;
                        doneOne();
                    }
                });
            }
        }, function doneAll() {
            cb();
        });
    };
    if (!form) return callback();
    loopFormElements(form, function (err) {
        if (formOutdated) form.set("outdated", true);
        callback(err, form);
    });
}

exports.trimWholeForm = function (form) {
    let loopFormElements = function (form, cb) {
        if (!form) return cb();
        if (!form.formElements) form.formElements = [];
        form.formElements.forEach(fe => {
            if (fe.elementType === "form") {
                fe.formElements = [];
            } else if (fe.elementType === "section") {
                loopFormElements(fe);
            }
        });
    };
    loopFormElements(form);
};

exports.byId = function (id, cb) {
    Form.findById(id, function (err, form) {
        if (err) return cb(err, form);
        fetchWholeForm(form, cb);
    });
};

exports.byIdList = function (idList, cb) {
    Form.find({}).where("_id").in(idList).exec(function (err, forms) {
        async.forEach(forms, function (form, doneOneForm) {
            fetchWholeForm(form, doneOneForm);
        }, function doneAllForms(e) {
            cb(e, forms);
        });
    });
};

exports.byTinyId = function (tinyId, cb) {
    Form.findOne({'tinyId': tinyId, archived: false}, function (err, form) {
        if (err) return cb(err, form);
        fetchWholeForm(form, cb);
    });
};

exports.byTinyIdVersion = function (tinyId, version, cb) {
    Form.findOne({'tinyId': tinyId, version: version}, function (err, form) {
        if (err) return cb(err, form);
        fetchWholeForm(form, cb);
    });
};

exports.latestVersionByTinyId = function (tinyId, cb) {
    Form.findOne({tinyId: tinyId, archived: false}, function (err, form) {
        cb(err, form.version);
    });
};

exports.byTinyIdList = function (tinyIdList, cb) {
    Form.find({}).where("tinyId").in(tinyIdList).exec(function (err, forms) {
        async.forEach(forms, function (form, doneOneForm) {
            fetchWholeForm(form, doneOneForm);
        }, function doneAllForms(e) {
            cb(e, forms);
        });
    });
};

/* ---------- PUT NEW REST API above ---------- */

exports.getPrimaryName = function (elt) {
    return elt.naming[0].designation;
};

exports.getStream = function (condition) {
    return Form.find(condition).sort({_id: -1}).cursor();
};

exports.count = function (condition, callback) {
    Form.count(condition).exec(function (err, count) {
        callback(err, count);
    });
};


exports.findForms = function (request, callback) {
    var criteria = {};
    if (request && request.term) {
        criteria = {
            "naming.designation": new RegExp(request.term)
        };
    }
    Form.find(criteria).where("archived").equals(false).exec(callback);
};

exports.update = function (elt, user, callback, special) {
    if (elt.toObject) elt = elt.toObject();
    return Form.findOne({_id: elt._id}).exec(function (err, form) {
        delete elt._id;
        if (!elt.history)
            elt.history = [];
        elt.history.push(form._id);
        elt.updated = new Date().toJSON();
        elt.updatedBy = {
            userId: user._id,
            username: user.username
        };
        elt.sources = form.sources;
        elt.comments = form.comments;
        if (special) special(elt, form);

        let newForm = new Form(elt);
        form.archived = true;
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

exports.byOtherId = function (source, id, cb) {
    Form.find({archived: false}).elemMatch("ids", {source: source, id: id}).exec(function (err, forms) {
        if (forms.length > 1)
            cb("Multiple results, returning first", forms[0]);
        else cb(err, forms[0]);
    });
};

exports.userTotalSpace = function (name, callback) {
    mongo_data_system.userTotalSpace(Form, name, callback);
};

exports.query = function (query, callback) {
    Form.find(query).exec(callback);
};

exports.transferSteward = function (from, to, callback) {
    Form.update({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}, {multi: true}).exec(function (err, result) {
        callback(err, result.nModified);
    });
};

exports.byTinyIdAndVersion = function (tinyId, version, callback) {
    var query = {'tinyId': tinyId};
    if (version) {
        query.version = version;
    } else {
        query.archived = false;
    }
    Form.findOne(query).exec(function (err, elt) {
        if (err) callback(err);
        else callback("", elt);
    });
};

exports.byTinyIdList = function (idList, callback) {
    Form.find({'archived': false}).where('tinyId')
        .in(idList)
        .exec(function (err, forms) {
            forms.forEach(mongo_data_system.formatElt);
            callback(err, forms);
        });
};

exports.byTinyIdListInOrder = function (idList, callback) {
    exports.byTinyIdList(idList, function (err, forms) {
        var reorderedForms = idList.map(function (id) {
            for (var i = 0; i < forms.length; i++) {
                if (id === forms[i].tinyId) return forms[i];
            }
        });
        callback(err, reorderedForms);
    });
};

exports.removeAttachmentLinks = function (id) {
    Form.update({"attachments.fileid": id}, {$pull: {"attachments": {"fileid": id}}});
};

exports.setAttachmentApproved = function (id) {
    Form.update(
        {"attachments.fileid": id},
        {
            $unset: {
                "attachments.$.pendingApproval": ""
            }
        },
        {multi: true}).exec();
};


exports.fileUsed = function (id, cb) {
    Form.find({"attachments.fileid": id}).count().exec(function (err, count) {
        cb(err, count > 0);
    });
};

exports.exists = function (condition, callback) {
    Form.count(condition, function (err, result) {
        callback(err, result > 0);
    });
};
