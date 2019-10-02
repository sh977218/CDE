import * as Ajv from 'ajv';
import { find, forEach } from 'lodash';
import { config } from 'server/system/parseConfig';
import { CdeForm } from 'shared/form/form.model';
import { CbError, User } from 'shared/models.model';
import { forwardError } from 'server/errorHandler/errorHandler';

const fs = require('fs');
const path = require('path');
const schemas = require('./schemas');
const mongoData = require('../system/mongo-data');
const connHelper = require('../system/connections');
// TODO: remove logging, error is passed out of this layer, handleError should fail-back and tee to no-db logger
const logging = require('../system/logging');
export const elastic = require('../form/elastic');

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

const file = fs.readFileSync(path.resolve(__dirname, '../../shared/form/assets/form.schema.json'));
try {
    const schema = JSON.parse(file.toString());
    schema.$async = true;
    validateSchema = validateSchema = ajvElt.compile(schema);
} catch (err) {
    console.log('Error: form.schema.json does not compile. ' + err);
    process.exit(1);
}


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
    }, err => next(`Form ${elt.tinyId} has error: ${err}`));
});

const conn = connHelper.establishConnection(config.database.appData);
export const Form = conn.model('Form', schemas.formSchema);
const FormAudit = conn.model('FormAudit', schemas.auditSchema);
export const FormDraft = conn.model('Draft', schemas.draftSchema);
export const FormSource = conn.model('formsources', schemas.formSourceSchema);

const auditModifications = mongoData.auditModifications(FormAudit);
export const getAuditLog = mongoData.auditGetLog(FormAudit);
export const dao = Form;

mongoData.attachables.push(Form);


function updateUser(elt, user) {
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

export function byTinyIdList(tinyIdList, callback) {
    Form.find({archived: false})
        .where('tinyId')
        .in(tinyIdList)
        .exec((err, forms) => {
            const result = [];
            forms.forEach(mongoData.formatElt);
            forEach(tinyIdList, t => {
                const c = find(forms, form => form.tinyId === t);
                if (c) {
                    result.push(c);
                }
            });
            callback(err, result);
        });
}

export function byTinyId(tinyId, cb) {
    return Form.findOne({tinyId, archived: false}, cb);
}

export function byTinyIdVersion(tinyId, version, cb) {
    if (version) {
        byTinyIdAndVersion(tinyId, version, cb);
    } else {
        byTinyId(tinyId, cb);
    }
}

export function byTinyIdAndVersion(tinyId, version, callback) {
    const query: any = {tinyId};
    if (version) {
        query.version = version;
    } else {
        query.$or = [{version: null}, {version: ''}];
    }
    Form.find(query).sort({updated: -1}).limit(1).exec(forwardError(callback, elts => {
        if (elts.length) {
            callback('', elts[0]);
        } else {
            callback('');
        }
    }));
}

export function draftByTinyId(tinyId, cb) {
    const cond = {
        tinyId,
        archived: false,
        elementType: 'form'
    };
    FormDraft.findOne(cond, cb);
}

export function draftById(id, cb) {
    const cond = {
        _id: id,
        elementType: 'form'
    };
    FormDraft.findOne(cond, cb);
}

export function draftSave(elt: CdeForm, user: User, cb: CbError<CdeForm>) {
    updateUser(elt, user);
    FormDraft.findById(elt._id, forwardError(cb, doc => {
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
    }));
}

export function draftDelete(tinyId, cb) {
    FormDraft.remove({tinyId}, cb);
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
    Form.findOne({tinyId, archived: false}, (err, form) => {
        cb(err, form.version);
    });
}

/* ---------- PUT NEW REST API above ---------- */

export function getStream(condition) {
    return Form.find(condition).sort({_id: -1}).cursor();
}

export function count(condition, callback) {
    return Form.countDocuments(condition, callback);
}

export function update(elt, user, options: any = {}, callback: CbError<CdeForm> = () => {
}) {
    Form.findById(elt._id, (err, form) => {
        if (form.archived) {
            callback(new Error('You are trying to edit an archived elements'));
            return;
        }
        delete elt._id;
        if (!elt.history) {
            elt.history = [];
        }
        elt.history.push(form._id);
        updateUser(elt, user);
        // user cannot edit sources.
        elt.sources = form.sources;

        // user cannot edit sources.
        if (!options.updateSource) {
            elt.sources = form.sources;
        }

        // because it's draft not edit attachment
        if (options.updateAttachments) {
            elt.attachments = form.attachments;
        }

        // loader skip update formElements, i.e. Qualified PhenX forms
        if (options.skipFormElements) {
            elt.formElements = form.formElements;
        }

        const newElt = new Form(elt);

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
    elt.created = Date.now();
    elt.createdBy = {
        userId: user._id,
        username: user.username
    };
    const newItem = new Form(elt);
    newItem.tinyId = mongoData.generateTinyId();
    newItem.save((err, newElt) => {
        callback(err, newElt);
        if (!err) {
            auditModifications(user, null, newElt);
        }
    });
}

export function query(query, callback) {
    Form.find(query).exec(callback);
}

export function byTinyIdListInOrder(idList, callback) {
    byTinyIdList(idList, (err, forms) => {
        const reorderedForms = idList.map(id => {
            for (const form of forms) {
                if (id === form.tinyId) {
                    return form;
                }
            }
        });
        callback(err, reorderedForms);
    });
}

export function originalSourceByTinyIdSourceName(tinyId, sourceName, cb) {
    FormSource.findOne({tinyId, source: sourceName}, cb);
}
