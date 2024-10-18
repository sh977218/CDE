import * as Ajv from 'ajv';
import { isEmpty } from 'lodash';
import { Document, Model, PreSaveMiddlewareFunction } from 'mongoose';
import { config, ObjectId } from 'server';
import { updateOrInsertDocument } from 'server/cde/elastic';
import {
    auditSchema as deAuditSchema,
    dataElementSchema,
    dataElementSourceSchema,
    draftSchema,
} from 'server/cde/schemas';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { auditModifications, generateTinyId, updateElt, updateMetadata } from 'server/system/mongo-data';
import { DataElement as DataElementClient } from 'shared/de/dataElement.model';
import { wipeDatatype } from 'shared/de/dataElement.model';
import { UpdateEltOptions } from 'shared/de/updateEltOptions';
import { EltLog, User } from 'shared/models.model';

const dataElementSchemaJson = require(global.assetDir('shared/de/assets/dataElement.schema.json'));

export type DataElement = DataElementClient;
export type DataElementDocument = Document<ObjectId, {}, DataElement> & DataElement;
export type DataElementDraft = DataElement;
export type DataElementDraftDocument = Document<ObjectId, {}, DataElementDraft> & DataElementDraft;
export type DataElementSource = DataElement;
export type DataElementSourceDocument = Document<ObjectId, {}, DataElementSource> & DataElementSource;

const ajvElt = new Ajv({ allErrors: true });
ajvElt.addSchema(require(global.assetDir('shared/de/assets/adminItem.schema')));
export let validateSchema: any;
try {
    const schema = dataElementSchemaJson;
    (schema as any).$async = true;
    validateSchema = validateSchema = ajvElt.compile(schema);
} catch (err) {
    console.log('Error: dataElement.schema.json does not compile. ' + err);
    process.exit(1);
}

const preSave: PreSaveMiddlewareFunction<DataElementDocument> = function preSave(this, next) {
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
                errorLogger.error(`Error Indexing CDE ${elt.tinyId}`, {
                    details: exception,
                    stack: new Error().stack,
                });
            }

            const valueDomain = elt.valueDomain;
            /* istanbul ignore if */
            if (valueDomain.datatype === 'Value List' && isEmpty(valueDomain.permissibleValues)) {
                next(new Error(`Cde ${elt.tinyId} Value List with empty permissible values.`));
            } else {
                next();
            }
        },
        (err: any) => {
            err.tinyId = elt.tinyId;
            err.eltId = elt._id.toString();
            next(err);
        }
    );
};
dataElementSchema.pre('save', preSave);
dataElementSourceSchema.pre('save', preSave);

const conn = establishConnection(config.database.appData);
export const dataElementModel: Model<DataElementDocument> = conn.model('DataElement', dataElementSchema) as any;
export const dataElementDraftModel: Model<DataElementDraftDocument> = conn.model(
    'DataElementDraft',
    draftSchema
) as any;
export const dataElementSourceModel: Model<DataElementSourceDocument> = conn.model(
    'DataElementSource',
    dataElementSourceSchema
) as any;
export const cdeAuditModel: Model<Document & EltLog> = conn.model('CdeAudit', deAuditSchema) as any;

const auditModificationsDe = auditModifications(cdeAuditModel);

export function byTinyId(tinyId: string): Promise<DataElementDocument | null> {
    return dataElementModel.findOne({ tinyId, archived: false }).then();
}

export function draftById(_id: ObjectId): Promise<DataElementDraftDocument> {
    return dataElementDraftModel.findOne({ _id }).then();
}

export function draftByTinyId(tinyId: string): Promise<DataElementDraftDocument> {
    return dataElementDraftModel
        .findOne({
            archived: false,
            tinyId,
        })
        .then();
}

export function draftDelete(tinyId: string): Promise<void> {
    return dataElementDraftModel.deleteMany({ tinyId }).then();
}

export function draftsList(criteria: any): Promise<DataElementDraftDocument[]> {
    return dataElementDraftModel
        .find(criteria, {
            'designations.designation': 1,
            'stewardOrg.name': 1,
            tinyId: 1,
            updated: 1,
            'updatedBy.username': 1,
        })
        .sort({ updated: -1 })
        .exec();
}

export function draftSave(elt: DataElement, user: User): Promise<DataElementDocument | null> {
    wipeDatatype(elt);
    updateMetadata(elt, user);
    return dataElementDraftModel.findById(elt._id).then(doc => {
        if (!doc) {
            return new dataElementDraftModel(elt).save();
        }
        /* istanbul ignore if */
        if (doc.__v !== elt.__v) {
            return Promise.resolve(null);
        }
        const version = elt.__v;
        elt.__v++;
        return dataElementDraftModel.findOneAndUpdate({ _id: elt._id, __v: version }, elt, { new: true }).then();
    });
}

/* ---------- PUT NEW REST API Implementation above  ---------- */

const viewedCdes: Record<string, number> = {};
const threshold = config.viewsIncrementThreshold;

export function inCdeView(cde: DataElement) {
    if (!viewedCdes[cde._id]) {
        viewedCdes[cde._id] = 0;
    }
    viewedCdes[cde._id]++;
    if (viewedCdes[cde._id] >= threshold && cde && cde._id) {
        viewedCdes[cde._id] = 0;
        dataElementModel.updateOne({ _id: cde._id }, { $inc: { views: threshold } }).exec();
    }
}

export function create(elt: DataElement, user: User): Promise<DataElementDocument> {
    wipeDatatype(elt);
    elt.created = Date.now();
    elt.createdBy = {
        username: user.username,
    };
    const newItem = new dataElementModel(elt);
    newItem.tinyId = generateTinyId();
    return newItem.save().then(newElt => {
        auditModificationsDe(user, null, newElt);
        return newElt;
    });
}

export function update(elt: DataElementDraft, user: User, options: UpdateEltOptions = {}): Promise<DataElement> {
    // version and changeNote are already saved on the draft
    return dataElementModel.findById(elt._id, null, null).then(dbDataElement => {
        /* istanbul ignore if */
        if (!dbDataElement) {
            throw new Error('Document Not Found');
        }
        /* istanbul ignore if */
        if (dbDataElement.archived) {
            throw new Error('You are trying to edit an archived element');
        }
        updateElt(elt, dbDataElement, user);
        wipeDatatype(elt);

        // user cannot edit sources.
        if (!options.updateSource) {
            elt.sources = dbDataElement.sources;
        }

        // because it's draft not edit attachment
        if (!options.updateAttachments) {
            elt.attachments = dbDataElement.attachments;
        }

        // created & createdBy cannot be changed.
        elt.created = dbDataElement.created;
        elt.createdBy = dbDataElement.createdBy;

        const newElt = new dataElementModel(elt);

        // archive dataElement and replace it with newElt
        return dataElementModel
            .findOneAndUpdate(
                {
                    _id: dbDataElement._id,
                    archived: false,
                },
                { $set: { archived: true } },
                null
            )
            .then(oldElt => {
                /* istanbul ignore if */
                if (!oldElt) {
                    throw new Error('Document not found');
                }
                return newElt.save().then(
                    savedElt => {
                        auditModificationsDe(user, dbDataElement, savedElt);
                        return savedElt;
                    },
                    err =>
                        dataElementModel
                            .findOneAndUpdate({ _id: dbDataElement._id }, { $set: { archived: false } })
                            .then(() => Promise.reject(err))
                );
            });
    });
}

export function derivationByInputs(inputTinyId: string): Promise<DataElementDocument[]> {
    return dataElementModel.find({ archived: false, 'derivationRules.inputs': inputTinyId }).exec();
}

export function findModifiedElementsSince(date: Date | string | number): Promise<DataElementDocument[]> {
    return dataElementModel.aggregate([
        {
            $match: {
                archived: false,
                updated: { $gte: date },
            },
        },
        { $limit: 2000 },
        { $sort: { updated: -1 } },
        { $group: { _id: '$tinyId' } } as any,
    ]);
}

export function originalSourceByTinyIdSourceName(
    tinyId: string,
    sourceName: string
): Promise<DataElementDocument | null> {
    return dataElementSourceModel.findOne({ tinyId, source: sourceName });
}
