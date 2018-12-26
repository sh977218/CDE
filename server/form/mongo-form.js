const _ = require('lodash');

const config = require('../system/parseConfig');
const schemas = require('./schemas');
const mongo_data = require('../system/mongo-data');
const connHelper = require('../system/connections');
const logging = require('../system/logging');
const elastic = require('./elastic');
const isOrgCurator = require('../../shared/system/authorizationShared').isOrgCurator;

exports.type = "form";
exports.name = "forms";

let conn = connHelper.establishConnection(config.database.appData);

schemas.formSchema.pre('save', function (next) {
    let self = this;
    try {
        elastic.updateOrInsert(self);
    } catch (exception) {
        logging.errorLogger.error("Error Indexing Form", {details: exception, stack: new Error().stack});
    }
    next();
});

let Form = conn.model('Form', schemas.formSchema);
let FormDraft = conn.model('Draft', schemas.draftSchema);

exports.Form = exports.dao = Form;
exports.FormDraft = exports.daoDraft = FormDraft;

mongo_data.attachables.push(exports.Form);

exports.elastic = elastic;

exports.byId = function (id, cb) {
    Form.findById(id, cb);
};

exports.byIdList = function (idList, cb) {
    Form.find({}).where("_id").in(idList).exec(cb);
};

exports.byTinyIdList = function (tinyIdList, callback) {
    Form.find({'archived': false})
        .where('tinyId')
        .in(tinyIdList)
        .exec((err, forms) => {
            let result = [];
            forms.forEach(mongo_data.formatElt);
            _.forEach(tinyIdList, t => {
                let c = _.find(forms, form => form.tinyId === t);
                if (c) result.push(c);
            });
            callback(err, result);
        });
};

exports.byTinyId = function (tinyId, cb) {
    Form.findOne({'tinyId': tinyId, archived: false}, cb);
};

exports.byTinyIdVersion = function (tinyId, version, cb) {
    if (version) this.byTinyIdAndVersion(tinyId, version, cb);
    else this.byTinyId(tinyId, cb);
};

exports.byTinyIdAndVersion = function (tinyId, version, callback) {
    let query = {tinyId: tinyId};
    if (version) query.version = version;
    else query.$or = [{version: null}, {version: ''}];
    Form.find(query).sort({'updated': -1}).limit(1).exec(function (err, elts) {
        if (err) callback(err);
        else if (elts.length) callback("", elts[0]);
        else callback("", null);
    });
};

exports.draftForm = function (tinyId, cb) {
    let cond = {
        tinyId: tinyId,
        archived: false,
        elementType: 'form'
    };
    FormDraft.findOne(cond, cb);
};

exports.draftFormById = function (id, cb) {
    let cond = {
        _id: id,
        elementType: 'form'
    };
    FormDraft.findOne(cond, cb);
};

exports.saveDraftForm = function (elt, cb) {
    delete elt.__v;
    FormDraft.findOneAndUpdate({_id: elt._id}, elt, {upsert: true, new: true}, cb);
};

exports.deleteDraftForm = function (tinyId, cb) {
    FormDraft.remove({tinyId: tinyId}, cb);
};

exports.draftsList = (criteria, cb) => {
    FormDraft.find(criteria, {"updatedBy.username": 1, "updated": 1, "designations.designation": 1, tinyId: 1})
        .sort({"updated": -1}).exec(cb);
};

exports.latestVersionByTinyId = function (tinyId, cb) {
    Form.findOne({tinyId: tinyId, archived: false}, function (err, form) {
        cb(err, form.version);
    });
};

/* ---------- PUT NEW REST API above ---------- */

exports.getPrimaryName = function (elt) {
    return elt.designations[0].designation;
};

exports.getStream = function (condition) {
    return Form.find(condition).sort({_id: -1}).cursor();
};

exports.count = function (condition, callback) {
    Form.count(condition).exec(function (err, count) {
        callback(err, count);
    });
};

exports.update = function (elt, user, callback, special) {
    if (elt.toObject) elt = elt.toObject();
    return Form.findOne({_id: elt._id}).exec(function (err, form) {
        delete elt._id;
        if (!elt.history) elt.history = [];
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
        if (newForm.designations.length < 1) {
            logging.errorLogger.error("Error: Cannot save form without names", {
                origin: "cde.mongo-form.update.1",
                stack: new Error().stack,
                details: "elt " + JSON.stringify(elt)
            });
            callback("Cannot save form without names");
        }

        newForm.save(function (err, savedForm) {
            if (err) {
                logging.errorLogger.error("Cannot save new form",
                    {
                        stack: new Error().stack,
                        details: "err " + err
                    });
                callback(err);
            } else {
                form.archived = true;
                Form.findOneAndUpdate({_id: form._id}, form, function (err) {
                    if (err) {
                        logging.errorLogger.error("Transaction failed. Cannot save archived form. Possible duplicated tinyId: " + newForm.tinyId,
                            {
                                stack: new Error().stack,
                                details: "err " + err
                            });
                    }
                    callback(err, savedForm);
                })
            }
        });
    });
};
exports.updatePromise = function (elt, user) {
    return new Promise(async (resolve, reject) => {
        let id = elt._id;
        if (elt.toObject) elt = elt.toObject();
        let form = await Form.findById(id);
        delete elt._id;
        if (!elt.history) elt.history = [];
        elt.history.push(form._id);
        elt.updated = new Date().toJSON();
        elt.updatedBy = user;
        elt.sources = form.sources;
        elt.comments = form.comments;
        let newForm = new Form(elt);
        if (!newForm.designations || newForm.designations.length === 0) {
            logging.errorLogger.error("Error: Cannot save Form without names", {
                origin: "cde.mongo-form.update.1",
                stack: new Error().stack,
                details: "elt " + JSON.stringify(elt)
            });
        }
        await newForm.save();
        form.archived = true;
        await form.save();
        resolve();
    })
};

exports.create = function (form, user, callback) {
    let newForm = new Form(form);
    if (!form.registrationState) {
        newForm.registrationState = {
            registrationStatus: "Incomplete"
        };
    }
    newForm.created = Date.now();
    newForm.tinyId = mongo_data.generateTinyId();
    newForm.createdBy = {
        userId: user._id
        , username: user.username
    };
    newForm.save(err => {
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

exports.query = function (query, callback) {
    Form.find(query).exec(callback);
};

exports.transferSteward = function (from, to, callback) {
    Form.updateMany({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}, {multi: true}).exec(function (err, result) {
        callback(err, result.nModified);
    });
};

exports.byTinyIdListInOrder = function (idList, callback) {
    exports.byTinyIdList(idList, function (err, forms) {
        let reorderedForms = idList.map(function (id) {
            for (let i = 0; i < forms.length; i++) {
                if (id === forms[i].tinyId) return forms[i];
            }
        });
        callback(err, reorderedForms);
    });
};

exports.exists = function (condition, callback) {
    Form.count(condition, function (err, result) {
        callback(err, result > 0);
    });
};


exports.checkOwnership = function (req, id, cb) {
    if (!req.isAuthenticated()) return cb("You are not authorized.", null);
    exports.byId(id, function (err, elt) {
        if (err || !elt) return cb("Element does not exist.", null);
        if (!isOrgCurator(req.user, elt.stewardOrg.name))
            return cb("You do not own this element.", null);
        cb(null, elt);
    });
};
