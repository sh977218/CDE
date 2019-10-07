import * as Ajv from 'ajv';
import { readdirSync, readFileSync } from 'fs';
import { Document, Model } from 'mongoose';
import { resolve } from 'path';
import { EltLogDocument } from 'server/cde/mongo-cde';
import { splitError } from 'server/errorHandler/errorHandler';
import { updateOrInsert } from 'server/form/elastic';
import { auditSchema, draftSchema, formSchema, formSourceSchema } from 'server/form/schemas';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { attachables, auditGetLog, auditModifications, formatElt, generateTinyId } from 'server/system/mongo-data';
import { config } from 'server/system/parseConfig';
import { CdeForm, CdeFormElastic } from 'shared/form/form.model';
import { CbError, CbError1, User } from 'shared/models.model';

export const type = 'form';
export const name = 'forms';
export const elastic = require('../../server/form/elastic');

export type CdeFormDocument = Document & CdeForm;
export type CdeFormDraft = CdeForm;
export type CdeFormDraftDocument = Document & CdeFormDraft;
export type CdeFormSource = CdeForm;
export type CdeFormSourceDocument = Document & CdeFormSource;

const ajvElt = new Ajv({allErrors: true});
readdirSync(resolve(__dirname, '../../shared/de/assets/')).forEach(file => {
    if (file.indexOf('.schema.json') > -1) {
        ajvElt.addSchema(require('../../shared/de/assets/' + file));
    }
});
export let validateSchema: any;

const file = readFileSync(resolve(__dirname, '../../shared/form/assets/form.schema.json'));
try {
    const schema = JSON.parse(file.toString());
    schema.$async = true;
    validateSchema = validateSchema = ajvElt.compile(schema);
} catch (err) {
    console.log('Error: form.schema.json does not compile. ' + err);
    process.exit(1);
}

formSchema.pre('save', function preSaveUsesThisForSomeReason(next) {
    const elt = this as CdeFormDocument;

    if (elt.archived) {
        return next();
    }
    validateSchema(elt).then(() => {
        try {
            updateOrInsert(elt);
        } catch (exception) {
            // TODO: remove logging, error is passed out of this layer, handleError should fail-back and tee to no-db logger
            errorLogger.error(`Error Indexing Form ${elt.tinyId}`, {
                details: exception,
                stack: new Error().stack
            });
        }
        next();
    }, (err: string) => next(new Error(`Form ${elt.tinyId} has error: ${err}`)));
});

const conn = establishConnection(config.database.appData);
export const formModel: Model<CdeFormDocument> = conn.model('Form', formSchema);
const formAuditModel: Model<EltLogDocument> = conn.model('FormAudit', auditSchema);
export const formDraftModel: Model<CdeFormDraftDocument> = conn.model('Draft', draftSchema);
export const formSourceModel: Model<CdeFormSourceDocument> = conn.model('formsources', formSourceSchema);

const auditModificationsForm = auditModifications(formAuditModel);
export const getAuditLog = auditGetLog(formAuditModel);
export const dao = formModel;
export const daoDraft = formDraftModel;

attachables.push(formModel);


function updateUser(elt: CdeForm, user: User) {
    elt.updated = new Date();
    elt.updatedBy = {
        userId: user._id,
        username: user.username
    };
}

export function byExisting(elt: CdeForm, cb: CbError<CdeFormDocument>) {
    formModel.findOne({_id: elt._id, tinyId: elt.tinyId}, cb);
}

export const byId = (id: string, cb: CbError<CdeFormDocument>) => formModel.findById(id).exec(cb);


export function byTinyIdList(tinyIdList: string[], cb: CbError<CdeFormElastic[]>): void {
    formModel.find({archived: false}).where('tinyId')
        .in(tinyIdList)
        .slice('valueDomain.permissibleValues', 10)
        .exec((err, docs) => {
            if (err) {
                return cb(err);
            }
            const cdes = docs.map(formatElt);
            cb(err, tinyIdList.map(t => cdes.filter(cde => cde.tinyId === t)[0]).filter(cde => !!cde));
        });
}

export const byTinyId = (tinyId: string, cb: CbError<CdeFormDocument>) => formModel.findOne({tinyId, archived: false}).exec(cb);

export function byTinyIdVersion(tinyId: string, version: string | undefined, cb: CbError<CdeFormDocument>) {
    if (version) {
        byTinyIdAndVersion(tinyId, version, cb);
    } else {
        byTinyId(tinyId, cb);
    }
}

export function byTinyIdAndVersion(tinyId: string, version: string | undefined, callback: CbError<CdeFormDocument>) {
    const query: any = {tinyId};
    if (version) {
        query.version = version;
    } else {
        query.$or = [{version: null}, {version: ''}];
    }
    return formModel.findOne(query).sort({updated: -1}).limit(1).exec(callback);
}

export function draftByTinyId(tinyId: string, cb: CbError<CdeFormDraftDocument>) {
    const cond = {
        tinyId,
        archived: false,
        elementType: 'form'
    };
    formDraftModel.findOne(cond, cb);
}

export function draftById(id: string, cb: CbError<CdeFormDocument>) {
    const cond = {
        _id: id,
        elementType: 'form'
    };
    formDraftModel.findOne(cond, cb);
}

export function draftSave(elt: CdeForm, user: User, cb: CbError<CdeFormDocument>) {
    updateUser(elt, user);
    formDraftModel.findById(elt._id, splitError(cb, doc => {
        if (!doc) {
            new formDraftModel(elt).save(cb);
            return;
        }
        if (doc.__v !== elt.__v) {
            cb();
            return;
        }
        const version = elt.__v;
        elt.__v++;
        formDraftModel.findOneAndUpdate({_id: elt._id, __v: version}, elt, {new: true},
            (err, doc) => cb(err, doc === null ? undefined : doc));
    }));
}

export function draftDelete(tinyId: string, cb: CbError) {
    formDraftModel.remove({tinyId}, cb);
}

export function draftsList(criteria: any): Promise<CdeFormDraftDocument[]>;
export function draftsList(criteria: any, cb: CbError<CdeFormDraftDocument[]>): void;
export function draftsList(criteria: any, cb?: CbError<CdeFormDraftDocument[]>): void | Promise<CdeFormDraftDocument[]> {
    return formDraftModel
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

export function latestVersionByTinyId(tinyId: string, cb: CbError<string | undefined>) {
    formModel.findOne({tinyId, archived: false}, (err, form) => {
        cb(err, form ? form.version : undefined);
    });
}

/* ---------- PUT NEW REST API above ---------- */

export function getStream(condition: any) {
    return formModel.find(condition).sort({_id: -1}).cursor();
}

export function count(condition: any, callback: CbError<number>) {
    return formModel.countDocuments(condition, callback);
}

export function update(elt: CdeForm, user: User, options: any = {}, callback: CbError<CdeForm> = () => {}) {
    formModel.findById(elt._id, (err, form) => {
        if (err || !form) {
            return callback(err || new Error('Document does not exist.'));
        }
        if (form.archived) {
            return callback(new Error('You are trying to edit an archived elements'));
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

        const newElt = new formModel(elt);

        // archive form and replace it with newElt
        formModel.findOneAndUpdate({_id: form._id, archived: false}, {$set: {archived: true}}, (err, doc) => {
            if (err || !doc) {
                return callback(err, doc === null ? undefined : doc);
            }
            newElt.save((err, savedElt) => {
                if (err) {
                    formModel.findOneAndUpdate({_id: form._id}, {$set: {archived: false}}, () => callback(err));
                } else {
                    callback(undefined, savedElt);
                    auditModificationsForm(user, form, savedElt);
                }
            });
        });
    });
}

export function create(elt: CdeForm, user: User, callback: CbError1<CdeFormDocument>) {
    elt.created = Date.now();
    elt.createdBy = {
        userId: user._id,
        username: user.username
    };
    const newItem = new formModel(elt);
    newItem.tinyId = generateTinyId();
    newItem.save((err, newElt) => {
        callback(err, newElt);
        if (!err) {
            auditModificationsForm(user, null, newElt);
        }
    });
}

export function byTinyIdListInOrder(idList: string[], callback: CbError<(CdeFormElastic | undefined)[]>) {
    byTinyIdList(idList, (err, forms) => {
        if (err || !forms) {
            return callback(err || new Error('forms not found'));
        }
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

export function originalSourceByTinyIdSourceName(tinyId: string, sourceName: string, cb: CbError<CdeFormDocument>) {
    formSourceModel.findOne({tinyId, source: sourceName}, cb);
}
