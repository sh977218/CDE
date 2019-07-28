import * as Ajv from 'ajv';
import { config } from 'server/system/parseConfig';
import { CdeForm } from 'shared/form/form.model';
import { CbError, User } from 'shared/models.model';

const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const schemas = require('./schemas');
const mongo_data = require('../system/mongo-data');
const connHelper = require('../system/connections');
const mongooseHelper = require('../system/mongooseHelper');
const logging = require('../system/logging'); // TODO: remove logging, error is passed out of this layer, handleError should fail-back and tee to no-db logger
export const elastic = require('../form/elastic');
const isOrgCurator = require('../../shared/system/authorizationShared').isOrgCurator;

export const type = 'form';
export const name = 'forms';

export type CdeFormDraft = CdeForm;

const ajvElt = new Ajv({allErrors: true});
fs.readdirSync(path.resolve(__dirname, '../../shared/de/assets/')).forEach(file => {
    if (file.indexOf('.schema.json') > -1) {
        ajvElt.addSchema(require('../../shared/de/assets/' + file));
    }
});
export let validateSchema: any;
fs.readFile(path.resolve(__dirname, '../../shared/form/assets/form.schema.json'), (err, file) => {
    if (!file) {
        console.log('Error: form.schema.json missing. ' + err);
        process.exit(1);
    }
    try {
        const schema = JSON.parse(file.toString());
        schema.$async = true;
        validateSchema = validateSchema = ajvElt.compile(schema);
    } catch (err) {
        console.log('Error: form.schema.json does not compile. ' + err);
        process.exit(1);
    }
});

schemas.formSchema.pre('save', function (next) {
    const elt = this;

    if (elt.archived) {
        return next();
    }
    validateSchema(elt).then(() => {
        try {
            elastic.updateOrInsert(elt);
        } catch (exception) {
            logging.errorLogger.error(`Error Indexing Form ${elt.tinyId}`, {
                details: exception,
                stack: new Error().stack
            });
        }
        next();
    }, err => {
        next(`Form ${elt.tinyId} has error: ` + err);
    });
});

const conn = connHelper.establishConnection(config.database.appData);
export const Form = conn.model('Form', schemas.formSchema);
let FormAudit = conn.model('FormAudit', schemas.auditSchema);
export const FormDraft = conn.model('Draft', schemas.draftSchema);
export const FormSource = conn.model('formsources', schemas.formSourceSchema);

let auditModifications = mongo_data.auditModifications(FormAudit);
export const getAuditLog = mongo_data.auditGetLog(FormAudit);
export const dao = Form;
export const daoDraft = FormDraft;

mongo_data.attachables.push(Form);

function defaultElt(elt) {
    if (!elt.registrationState || !elt.registrationState.registrationStatus) {
        elt.registrationState = {registrationStatus: 'Incomplete'};
    }
}

function updateUser(elt, user) {
    defaultElt(elt);
    if (!elt.created) elt.created = new Date();
    if (!elt.createdBy) {
        elt.createdBy = {
            userId: user._id,
            username: user.username
        };
    }
    elt.updated = new Date();
    elt.updatedBy = {
        userId: user._id,
        username: user.username
    };
}

export function byExisting(elt: CdeForm, cb: CbError<CdeForm>) {
    Form.findOne({_id: elt._id, tinyId: elt.tinyId}, cb);
}

export function byId(id, cb) {
    Form.findById(id, cb);
}

export function byIdList(idList, cb) {
    Form.find({}).where('_id').in(idList).exec(cb);
}

export function byTinyIdList(tinyIdList, callback) {
    Form.find({archived: false})
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
}

export function byTinyId(tinyId, cb) {
    return Form.findOne({tinyId: tinyId, archived: false}, cb);
}

export function byTinyIdVersion(tinyId, version, cb) {
    if (version) this.byTinyIdAndVersion(tinyId, version, cb);
    else this.byTinyId(tinyId, cb);
}

export function byTinyIdAndVersion(tinyId, version, callback) {
    let query: any = {tinyId: tinyId};
    if (version) query.version = version;
    else query.$or = [{version: null}, {version: ''}];
    Form.find(query).sort({updated: -1}).limit(1).exec(function (err, elts) {
        if (err) callback(err);
        else if (elts.length) callback('', elts[0]);
        else callback('', null);
    });
}

export function draftByTinyId(tinyId, cb) {
    let cond = {
        tinyId: tinyId,
        archived: false,
        elementType: 'form'
    };
    FormDraft.findOne(cond, cb);
}

export function draftById(id, cb) {
    let cond = {
        _id: id,
        elementType: 'form'
    };
    FormDraft.findOne(cond, cb);
}

export function draftSave(elt: CdeForm, user: User, cb: CbError<CdeForm>) {
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
}

export function draftDelete(tinyId, cb) {
    FormDraft.remove({tinyId: tinyId}, cb);
}

export function draftsList(criteria): Promise<CdeFormDraft[]>;
export function draftsList(criteria, cb: CbError): void;
export function draftsList(criteria, cb?: CbError): void | Promise<CdeFormDraft[]> {
    return FormDraft
        .find(criteria, {
            'designations.designation': 1,
            'stewardOrg.name': 1,
            tinyId: 1,
            updated: 1,
            'updatedBy.username': 1
        })
        .sort({updated: -1})
        .exec(cb);
}

export function latestVersionByTinyId(tinyId, cb) {
    Form.findOne({tinyId: tinyId, archived: false}, function (err, form) {
        cb(err, form.version);
    });
}

/* ---------- PUT NEW REST API above ---------- */

export function getPrimaryName(elt) {
    return elt.designations[0].designation;
}

export function getStream(condition) {
    return Form.find(condition).sort({_id: -1}).cursor();
}

export function count(condition, callback) {
    return Form.countDocuments(condition, callback);
}

export function update(elt, user, options: any = {}, callback: CbError<CdeForm> = () => {
}) {
    if (elt.toObject) elt = elt.toObject();
    Form.findById(elt._id, (err, form) => {
        if (form.archived) {
            callback(new Error('You are trying to edit an archived elements'));
            return;
        }
        delete elt._id;
        if (!elt.history) elt.history = [];
        elt.history.push(form._id);
        updateUser(elt, user);
        // user cannot edit sources.
        elt.sources = form.sources;

        // because it's draft not edit attachment
        if (options.updateAttachments) {
            elt.attachments = form.attachments;
        }

        let newElt = new Form(elt);

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
}

export function create(elt, user, callback) {
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
}

export function byOtherId(source, id, cb) {
    Form.find({archived: false}).elemMatch('ids', {source: source, id: id}).exec(function (err, forms) {
        if (forms.length > 1) {
            cb('Multiple results, returning first', forms[0]);
        } else cb(err, forms[0]);
    });
}

export function query(query, callback) {
    Form.find(query).exec(callback);
}

export function transferSteward(from, to, callback) {
    Form.updateMany({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}).exec(function (err, result) {
        callback(err, result.nModified);
    });
}

export function byTinyIdListInOrder(idList, callback) {
    byTinyIdList(idList, function (err, forms) {
        let reorderedForms = idList.map(function (id) {
            for (let i = 0; i < forms.length; i++) {
                if (id === forms[i].tinyId) return forms[i];
            }
        });
        callback(err, reorderedForms);
    });
}

export function exists(condition, cb: CbError<boolean>) {
    mongooseHelper.exists(Form, condition, cb);
}

export function checkOwnership(req, id, cb) {
    if (!req.isAuthenticated()) return cb('You are not authorized.', null);
    byId(id, function (err, elt) {
        if (err || !elt) return cb('Element does not exist.', null);
        if (!isOrgCurator(req.user, elt.stewardOrg.name)) {
            return cb('You do not own this element.', null);
        }
        cb(null, elt);
    });
}

export function originalSourceByTinyIdSourceName(tinyId, sourceName, cb) {
    FormSource.findOne({tinyId: tinyId, source: sourceName}, cb);
}
