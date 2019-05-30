const Ajv = require('ajv');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const config = require('../system/parseConfig');
const schemas = require('./schemas');
const mongo_data = require('../system/mongo-data');
const connHelper = require('../system/connections');
const mongooseHelper = require('../system/mongooseHelper');
const logging = require('../system/logging'); // TODO: remove logging, error is passed out of this layer, handleError should fail-back and tee to no-db logger
const elastic = require('./elastic');
const isOrgCurator = require('../../shared/system/authorizationShared').isOrgCurator;

exports.type = 'form';
exports.name = 'forms';

const ajvElt = new Ajv();
fs.readdirSync(path.resolve(__dirname, '../../shared/de/assets/')).forEach(file => {
    if (file.indexOf('.schema.json') > -1) {
        ajvElt.addSchema(require('../../shared/de/assets/' + file));
    }
});
let validateSchema;
fs.readFile(path.resolve(__dirname, '../../shared/form/assets/form.schema.json'), (err, file) => {
    if (!file) {
        console.log('Error: form.schema.json missing. ' + err);
        process.exit(1);
    }
    try {
        const schema = JSON.parse(file.toString());
        schema.$async = true;
        exports.validateSchema = validateSchema = ajvElt.compile(schema);
    } catch (err) {
        console.log('Error: form.schema.json does not compile. ' + err);
        process.exit(1);
    }
});

schemas.formSchema.pre('save', function (next) {
    let elt = this;

    validateSchema(elt)
        .catch(err => next(err instanceof Ajv.ValidationError
            ? 'errors:' + err.errors.map(e => e.dataPath + ': ' + e.message).join(', ')
            : err
        ))
        .then(() => {
            try {
                elastic.updateOrInsert(elt);
            } catch (exception) {
                logging.errorLogger.error('Error Indexing Form', {details: exception, stack: new Error().stack});
            }

            next();
        });
});

let conn = connHelper.establishConnection(config.database.appData);
let Form = conn.model('Form', schemas.formSchema);
let FormAudit = conn.model('FormAudit', schemas.auditSchema);
let FormDraft = conn.model('Draft', schemas.draftSchema);
let FormSource = conn.model('formsources', schemas.formSourceSchema);

let auditModifications = mongo_data.auditModifications(FormAudit);
exports.getAuditLog = mongo_data.auditGetLog(FormAudit);
exports.Form = exports.dao = Form;
exports.FormDraft = exports.daoDraft = FormDraft;
exports.FormSource = FormSource;

mongo_data.attachables.push(exports.Form);

exports.elastic = elastic;

function defaultElt(elt) {
    if (!elt.registrationState || !elt.registrationState.registrationStatus) {
        elt.registrationState = {registrationStatus: 'Incomplete'};
    }
}

function updateUser(elt, user) {
    defaultElt(elt);
    if (!elt.created) elt.created = new Date();
    if (!elt.createdBy.userId && !elt.createdBy.username) { // mongoose creates "createdBy"
        elt.createdBy.userId = user._id;
        elt.createdBy.username = user.username;
    }
    elt.updated = new Date();
    elt.updatedBy = {
        userId: user._id,
        username: user.username
    };
}

// cb(err, elt)
exports.byExisting = (elt, cb) => {
    Form.findOne({_id: elt._id, tinyId: elt.tinyId}, cb);
};

exports.byId = function (id, cb) {
    Form.findById(id, cb);
};

exports.byIdList = function (idList, cb) {
    Form.find({}).where('_id').in(idList).exec(cb);
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
    return Form.findOne({'tinyId': tinyId, archived: false}, cb);
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
        else if (elts.length) callback('', elts[0]);
        else callback('', null);
    });
};

exports.draftByTinyId = function (tinyId, cb) {
    let cond = {
        tinyId: tinyId,
        archived: false,
        elementType: 'form'
    };
    FormDraft.findOne(cond, cb);
};

exports.draftById = function (id, cb) {
    let cond = {
        _id: id,
        elementType: 'form'
    };
    FormDraft.findOne(cond, cb);
};

// cb(err, newDoc)
exports.draftSave = function (elt, user, cb) {
    updateUser(elt, user);
    FormDraft.findById(elt._id, (err, doc) => {
        if (err) {
            cb(err);
            return;
        }
        if (!doc) {
            new FormDraft(elt).save(cb);
            return;
        }
        if (doc.__v !== elt.__v) {
            cb();
            return;
        }
        const version = elt.__v;
        elt.__v++;
        FormDraft.findOneAndUpdate({_id: elt._id, __v: version}, elt, {new: true}, cb);
    });
};

exports.draftDelete = function (tinyId, cb) {
    FormDraft.remove({tinyId: tinyId}, cb);
};

exports.draftsList = (criteria, cb) => {
    return FormDraft
        .find(criteria, {
            'designations.designation': 1,
            'stewardOrg.name': 1,
            tinyId: 1,
            updated: 1,
            'updatedBy.username': 1
        })
        .sort({'updated': -1})
        .exec(cb);
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
    return Form.countDocuments(condition, callback);
};

exports.update = function (elt, user, callback, special) {
    if (elt.toObject) elt = elt.toObject();
    return Form.findById(elt._id, (err, form) => {
        if (form.archived) {
            callback('You are trying to edit an archived elements');
            return;
        }
        delete elt._id;
        if (!elt.history) elt.history = [];
        elt.history.push(form._id);
        updateUser(elt, user);
        elt.sources = form.sources;
        elt.comments = form.comments;
        let newElt = new Form(elt);

        if (special) {
            special(newElt, form);
        }

        // archive form and replace it with newElt
        Form.findOneAndUpdate({_id: form._id, archived: false}, {$set: {archived: true}}, (err, doc) => {
            if (err || !doc) {
                callback(err, doc);
                return;
            }
            newElt.save((err, savedElt) => {
                if (err) {
                    Form.findOneAndUpdate({_id: form._id}, {$set: {archived: false}}, () => callback(err));
                } else {
                    callback(undefined, savedElt);
                    auditModifications(user, form, savedElt);
                }
            });
        });
    });
};

exports.updatePromise = function (elt, user) {
    return new Promise(resolve => {
        exports.update(elt, user, resolve);
    });
};

exports.create = function (elt, user, callback) {
    defaultElt(elt);
    elt.created = Date.now();
    elt.createdBy = {
        userId: user._id,
        username: user.username
    };
    let newItem = new Form(elt);
    newItem.tinyId = mongo_data.generateTinyId();
    newItem.save((err, newElt) => {
        callback(err, newElt);
        if (!err) auditModifications(user, null, newElt);
    });
};

exports.byOtherId = function (source, id, cb) {
    Form.find({archived: false}).elemMatch('ids', {source: source, id: id}).exec(function (err, forms) {
        if (forms.length > 1)
            cb('Multiple results, returning first', forms[0]);
        else cb(err, forms[0]);
    });
};

exports.query = function (query, callback) {
    Form.find(query).exec(callback);
};

exports.transferSteward = function (from, to, callback) {
    Form.updateMany({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}).exec(function (err, result) {
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

// cb(err, bool)
exports.exists = (condition, cb) => {
    mongooseHelper.exists(Form, condition, cb);
};

exports.checkOwnership = function (req, id, cb) {
    if (!req.isAuthenticated()) return cb('You are not authorized.', null);
    exports.byId(id, function (err, elt) {
        if (err || !elt) return cb('Element does not exist.', null);
        if (!isOrgCurator(req.user, elt.stewardOrg.name))
            return cb('You do not own this element.', null);
        cb(null, elt);
    });
};


exports.originalSourceByTinyIdSourceName = function (tinyId, sourceName, cb) {
    FormSource.findOne({tinyId: tinyId, source: sourceName}, cb);
};
