import * as Ajv from 'ajv';
import { readdirSync, readFileSync } from 'fs';
import { Document, Model, PreSaveMiddlewareFunction } from 'mongoose';
import { resolve } from 'path';
import { config, ObjectId } from 'server';
import { EltLogDocument } from 'server/cde/mongo-cde';
import { splitError } from 'server/errorHandler';
import { updateOrInsertDocument } from 'server/form/elastic';
import { auditSchema, draftSchema, formSchema, formSourceSchema } from 'server/form/schemas';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { auditGetLog, auditModifications, generateTinyId } from 'server/system/mongo-data';
import { UpdateEltOptions } from 'shared/de/updateEltOptions';
import { CdeForm } from 'shared/form/form.model';
import { CbError1, User } from 'shared/models.model';

export type CdeFormDocument = Document & CdeForm;
export type CdeFormDraft = CdeForm;
export type CdeFormDraftDocument = Document & CdeFormDraft;
export type CdeFormSource = CdeForm;
export type CdeFormSourceDocument = Document & CdeFormSource;

const ajvElt = new Ajv({allErrors: true});
readdirSync(resolve(global.assetDir('shared/de/assets/'))).forEach(file => {
    if (file.indexOf('.schema.json') > -1) {
        ajvElt.addSchema(require(global.assetDir('shared/de/assets', file)));
    }
});
export let validateSchema: any;
const file = readFileSync(resolve(global.assetDir('shared/form/assets/form.schema.json')));
try {
    const schema = JSON.parse(file.toString());
    schema.$async = true;
    validateSchema = validateSchema = ajvElt.compile(schema);
} catch (err) {
    console.log('Error: form.schema.json does not compile. ' + err);
    process.exit(1);
}

const preSave: PreSaveMiddlewareFunction<CdeFormDocument> = function preSave(this: CdeFormDocument, next) {
    const elt = this;

    /* istanbul ignore if */
    if (elt.archived) {
        return next();
    }
    validateSchema(elt).then(() => {
        try {
            updateOrInsertDocument(elt);
        } catch (exception) {
            // TODO: remove logging, error is passed out of this layer, handleError should fail-back and tee to no-db logger
            errorLogger.error(`Error Indexing Form ${elt.tinyId}`, {
                details: exception,
                stack: new Error().stack
            });
        }
        next();
    }, (err: any) => {
        err.tinyId = elt.tinyId;
        err.eltId = elt._id.toString();
        next(err);
    });
}
formSchema.pre('save', preSave);
formSourceSchema.pre('save', preSave);

const conn = establishConnection(config.database.appData);
export const formModel: Model<CdeFormDocument> = conn.model('Form', formSchema);
const formAuditModel: Model<EltLogDocument> = conn.model('FormAudit', auditSchema);
export const formDraftModel: Model<CdeFormDraftDocument> = conn.model('Draft', draftSchema);
export const formSourceModel: Model<CdeFormSourceDocument> = conn.model('formsources', formSourceSchema);

const auditModificationsForm = auditModifications(formAuditModel);
export const getAuditLog = auditGetLog(formAuditModel);

export function byTinyId(tinyId: string): Promise<CdeFormDocument | null>;
export function byTinyId(tinyId: string, cb: CbError1<CdeFormDocument | null>): void;
export function byTinyId(tinyId: string, cb?: CbError1<CdeFormDocument | null>): Promise<CdeFormDocument | null> | void {
    return formModel.findOne({archived: false, tinyId}).exec(cb);
}

export function draftById(_id: ObjectId): Promise<CdeFormDocument> {
    return formDraftModel.findOne({
        _id,
        elementType: 'form'
    } as Partial<CdeForm>).then();
}

export function draftByTinyId(tinyId: string): Promise<CdeFormDraftDocument> {
    return formDraftModel.findOne({
        tinyId,
        archived: false,
        elementType: 'form'
    } as Partial<CdeForm>).then();
}

export function draftDelete(tinyId: string): Promise<void> {
    return formDraftModel.deleteMany({tinyId}).then();
}

export function draftsList(criteria: any): Promise<CdeFormDraftDocument[]>;
export function draftsList(criteria: any, cb: CbError1<CdeFormDraftDocument[]>): void;
export function draftsList(criteria: any, cb?: CbError1<CdeFormDraftDocument[]>): void | Promise<CdeFormDraftDocument[]> {
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

export function draftSave(elt: CdeForm, user: User, cb: CbError1<CdeFormDocument | void>) {
    updateUser(elt, user);
    formDraftModel.findById(elt._id, splitError(cb, doc => {
        if (!doc) {
            new formDraftModel(elt).save(cb);
            return;
        }
        if (doc.__v !== elt.__v) {
            cb(null);
            return;
        }
        const version = elt.__v;
        elt.__v++;
        formDraftModel.findOneAndUpdate({_id: elt._id, __v: version}, elt, {new: true},
            (err, doc) => cb(err, doc === null ? undefined : doc));
    }));
}

/* ---------- PUT NEW REST API above ---------- */

export function update(elt: CdeForm, user: User, options: UpdateEltOptions = {}): Promise<CdeForm> {
    return formModel.findById(elt._id, null, null)
        .then(form => {
            /* istanbul ignore if */
            if (!form) {
                throw new Error('Document does not exist.');
            }
            /* istanbul ignore if */
            if (form.archived) {
                throw new Error('You are trying to edit an archived element');
            }
            delete elt._id;
            /* istanbul ignore if */
            if (!elt.history) {
                elt.history = [];
            }
            elt.history.push(form._id);
            updateUser(elt, user);

            // user cannot edit sources.
            if (!options.updateSource) {
                elt.sources = form.sources;
            }

            // because it's draft not edit attachment
            if (!options.updateAttachments) {
                elt.attachments = form.attachments;
            }

            // loader skip update formElements, i.e. Qualified PhenX forms, PHQ-9
            /* istanbul ignore if */
            if (options.skipFormElements) {
                elt.formElements = form.formElements;
            }

            // created & createdBy cannot be changed.
            elt.created = form.created;
            elt.createdBy = form.createdBy;

            const newElt = new formModel(elt);

            // archive form and replace it with newElt
            return formModel.findOneAndUpdate(
                {
                    _id: form._id,
                    archived: false
                },
                {$set: {archived: true}},
                null
            )
                .then(oldElt => {
                    /* istanbul ignore if */
                    if (!oldElt) {
                        throw new Error('document not found');
                    }
                    return newElt.save().then(
                        savedElt => {
                            auditModificationsForm(user, form, savedElt);
                            return savedElt;
                        },
                        err => formModel.findOneAndUpdate({_id: form._id}, {$set: {archived: false}})
                            .then(/* istanbul ignore next */ () => Promise.reject(err))
                    );
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

export function originalSourceByTinyIdSourceName(tinyId: string, sourceName: string, cb: CbError1<CdeFormDocument>) {
    formSourceModel.findOne({tinyId, source: sourceName}, cb);
}

function updateUser(elt: CdeForm, user: User) {
    elt.updated = new Date();
    elt.updatedBy = {
        userId: user._id,
        username: user.username
    };
}
