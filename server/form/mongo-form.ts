import * as Ajv from 'ajv';
import { readdirSync, readFileSync } from 'fs';
import { Document, Model, PreSaveMiddlewareFunction } from 'mongoose';
import { resolve } from 'path';
import { config, ObjectId } from 'server';
import { updateOrInsertDocument } from 'server/form/elastic';
import { auditSchema as formAuditSchema, draftSchema, formSchema, formSourceSchema } from 'server/form/schemas';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { auditModifications, generateTinyId, updateElt, updateMetadata } from 'server/system/mongo-data';
import { UpdateEltOptions } from 'shared/de/updateEltOptions';
import { CdeForm } from 'shared/form/form.model';
import { EltLog, User } from 'shared/models.model';

export type CdeFormDocument = Document<ObjectId, {}, CdeForm> & CdeForm;
export type CdeFormDraft = CdeForm;
export type CdeFormDraftDocument = Document<ObjectId, {}, CdeFormDraft> & CdeFormDraft;
export type CdeFormSource = CdeForm;
export type CdeFormSourceDocument = Document<ObjectId, {}, CdeFormSource> & CdeFormSource;

const ajvElt = new Ajv({ allErrors: true });
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
    validateSchema(elt).then(
        () => {
            try {
                updateOrInsertDocument(elt);
            } catch (exception) {
                // TODO: remove logging, error is passed out of this layer, handleError should fail-back and tee to no-db logger
                errorLogger.error(`Error Indexing Form ${elt.tinyId}`, {
                    details: exception,
                    stack: new Error().stack,
                });
            }
            next();
        },
        (err: any) => {
            err.tinyId = elt.tinyId;
            err.eltId = elt._id.toString();
            next(err);
        }
    );
};
formSchema.pre('save', preSave);
formSourceSchema.pre('save', preSave);

const conn = establishConnection(config.database.appData);
export const formModel: Model<CdeFormDocument> = conn.model('Form', formSchema) as any;
export const formDraftModel: Model<CdeFormDraftDocument> = conn.model('Draft', draftSchema) as any;
export const formSourceModel: Model<CdeFormSourceDocument> = conn.model('formsources', formSourceSchema) as any;
export const formAuditModel: Model<Document & EltLog> = conn.model('FormAudit', formAuditSchema) as any;

const auditModificationsForm = auditModifications(formAuditModel);

export function byTinyId(tinyId: string): Promise<CdeFormDocument | null> {
    return formModel.findOne({ archived: false, tinyId }).then();
}

export function draftById(_id: ObjectId): Promise<CdeFormDocument> {
    return formDraftModel
        .findOne({
            _id,
            elementType: 'form',
        } as Partial<CdeForm>)
        .then();
}

export function draftByTinyId(tinyId: string): Promise<CdeFormDraftDocument> {
    return formDraftModel
        .findOne({
            tinyId,
            archived: false,
            elementType: 'form',
        } as Partial<CdeForm>)
        .then();
}

export function draftDelete(tinyId: string): Promise<void> {
    return formDraftModel.deleteMany({ tinyId }).then();
}

export function draftsList(criteria: any): Promise<CdeFormDraftDocument[]> {
    return formDraftModel
        .find(criteria, {
            'designations.designation': 1,
            'stewardOrg.name': 1,
            tinyId: 1,
            updated: 1,
            'updatedBy.username': 1,
        })
        .sort({ updated: -1 })
        .then();
}

export function draftSave(elt: CdeForm, user: User): Promise<CdeFormDocument | null> {
    updateMetadata(elt, user);
    return formDraftModel.findById(elt._id).then(doc => {
        if (!doc) {
            return new formDraftModel(elt).save();
        }
        if (doc.__v !== elt.__v) {
            return null;
        }
        const version = elt.__v;
        elt.__v++;
        return formDraftModel.findOneAndUpdate({ _id: elt._id, __v: version }, elt, { new: true }).then();
    });
}

/* ---------- PUT NEW REST API above ---------- */

export function update(elt: CdeForm, user: User, options: UpdateEltOptions = {}): Promise<CdeForm> {
    return formModel.findById(elt._id, null, null).then(dbForm => {
        /* istanbul ignore if */
        if (!dbForm) {
            throw new Error('Document does not exist.');
        }
        /* istanbul ignore if */
        if (dbForm.archived) {
            throw new Error('You are trying to edit an archived element');
        }

        updateElt(elt, dbForm, user);

        // user cannot edit sources.
        if (!options.updateSource) {
            elt.sources = dbForm.sources;
        }

        // because it's draft not edit attachment
        if (!options.updateAttachments) {
            elt.attachments = dbForm.attachments;
        }

        // loader skip update formElements, i.e. Qualified PhenX forms, PHQ-9
        /* istanbul ignore if */
        if (options.skipFormElements) {
            elt.formElements = dbForm.formElements;
        }

        // created & createdBy cannot be changed.
        elt.created = dbForm.created;
        elt.createdBy = dbForm.createdBy;

        // updated by special process, not editing
        elt.isBundle = dbForm.isBundle;

        const newElt = new formModel(elt);

        // archive form and replace it with newElt
        return formModel
            .findOneAndUpdate(
                {
                    _id: dbForm._id,
                    archived: false,
                },
                { $set: { archived: true } },
                null
            )
            .then(oldElt => {
                /* istanbul ignore if */
                if (!oldElt) {
                    throw new Error('document not found');
                }
                return newElt.save().then(
                    savedElt => {
                        auditModificationsForm(user, dbForm, savedElt);
                        return savedElt;
                    },
                    err =>
                        formModel
                            .findOneAndUpdate({ _id: dbForm._id }, { $set: { archived: false } })
                            .then(/* istanbul ignore next */ () => Promise.reject(err))
                );
            });
    });
}

export function create(elt: CdeForm, user: User): Promise<CdeFormDocument> {
    elt.created = Date.now();
    elt.createdBy = {
        username: user.username,
    };
    const newItem = new formModel(elt);
    newItem.tinyId = generateTinyId();
    return newItem.save().then(newElt => {
        auditModificationsForm(user, null, newElt);
        return newElt;
    });
}

export function originalSourceByTinyIdSourceName(tinyId: string, sourceName: string): Promise<CdeFormDocument | null> {
    return formSourceModel.findOne({ tinyId, source: sourceName });
}
