import * as Ajv from 'ajv';
import { isEmpty } from 'lodash';
import { Document, Model, PreSaveMiddlewareFunction } from 'mongoose';
import { config, ObjectId } from 'server';
import { updateOrInsertDocument } from 'server/cde/elastic';
import { auditSchema, dataElementSchema, dataElementSourceSchema, draftSchema } from 'server/cde/schemas';
import { splitError } from 'server/errorHandler';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { auditGetLog, auditModifications, generateTinyId } from 'server/system/mongo-data';
import { DataElement as DataElementClient } from 'shared/de/dataElement.model';
import { wipeDatatype } from 'shared/de/dataElement.model';
import { UpdateEltOptions } from 'shared/de/updateEltOptions';
import { CbError1, EltLog, User } from 'shared/models.model';

const dataElementSchemaJson = require(global.assetDir('shared/de/assets/dataElement.schema.json'));

export type DataElement = DataElementClient;
export type DataElementDocument = Document<ObjectId, {}, DataElement> & DataElement;
export type DataElementDraft = DataElement;
export type DataElementDraftDocument = Document<ObjectId, {}, DataElementDraft> & DataElementDraft;
export type DataElementSource = DataElement;
export type DataElementSourceDocument = Document<ObjectId, {}, DataElementSource> & DataElementSource;
export type EltLogDocument = Document<ObjectId, {}, EltLog> & EltLog;

const ajvElt = new Ajv({allErrors: true});
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
    validateSchema(elt).then(() => {
        try {
            updateOrInsertDocument(elt);
        } catch (exception) {
            errorLogger.error(`Error Indexing CDE ${elt.tinyId}`, {
                details: exception,
                stack: new Error().stack
            });
        }

        const valueDomain = elt.valueDomain;
        /* istanbul ignore if */
        if (valueDomain.datatype === 'Value List' && isEmpty(valueDomain.permissibleValues)) {
            next(new Error(`Cde ${elt.tinyId} Value List with empty permissible values.`));
        } else {
            next();
        }
    }, (err: any) => {
        err.tinyId = elt.tinyId;
        err.eltId = elt._id.toString();
        next(err);
    });
}
dataElementSchema.pre('save', preSave);
dataElementSourceSchema.pre('save', preSave);

const conn = establishConnection(config.database.appData);
const cdeAuditModel: Model<EltLogDocument> = conn.model('CdeAudit', auditSchema);
export const dataElementModel: Model<DataElementDocument> = conn.model('DataElement', dataElementSchema);
export const dataElementDraftModel: Model<DataElementDraftDocument> = conn.model('DataElementDraft', draftSchema);
export const dataElementSourceModel: Model<DataElementSourceDocument> = conn.model('DataElementSource', dataElementSourceSchema);

const auditModificationsDe = auditModifications(cdeAuditModel);
export const getAuditLog = auditGetLog(cdeAuditModel);

export function byTinyId(tinyId: string): Promise<DataElementDocument | null>;
export function byTinyId(tinyId: string, cb: CbError1<DataElementDocument | null>): void;
export function byTinyId(tinyId: string, cb?: CbError1<DataElementDocument | null>): Promise<DataElementDocument | null> | void {
    return cb
        ? dataElementModel.findOne({tinyId, archived: false}).exec(cb)
        : dataElementModel.findOne({tinyId, archived: false}).then();
}

export function draftById(_id: ObjectId): Promise<DataElementDraftDocument> {
    return dataElementDraftModel.findOne({_id}).then();
}

export function draftByTinyId(tinyId: string): Promise<DataElementDraftDocument> {
    return dataElementDraftModel.findOne({
        archived: false,
        tinyId,
    }).then();
}

export function draftDelete(tinyId: string): Promise<void> {
    return dataElementDraftModel.deleteMany({tinyId}).then();
}

export function draftsList(criteria: any): Promise<DataElementDraftDocument[]>;
export function draftsList(criteria: any, cb: CbError1<DataElementDraftDocument>): void;
export function draftsList(criteria: any, cb?: CbError1<DataElementDraftDocument>): void | Promise<DataElementDraftDocument[]> {
    return dataElementDraftModel
        .find(criteria, {
            'designations.designation': 1,
            'stewardOrg.name': 1,
            tinyId: 1,
            updated: 1,
            'updatedBy.username': 1,
        })
        .sort({updated: -1})
        .exec(cb as any);
}

export function draftSave(elt: DataElement, user: User, cb: CbError1<DataElementDocument | void>): void {
    updateUser(elt, user);
    dataElementDraftModel.findById(elt._id, splitError(cb, doc => {
        if (!doc) {
            new dataElementDraftModel(elt).save(cb);
            return;
        }
        /* istanbul ignore if */
        if (doc.__v !== elt.__v) {
            return cb(null);
        }
        const version = elt.__v;
        elt.__v++;
        dataElementDraftModel.findOneAndUpdate({_id: elt._id, __v: version}, elt, {new: true},
            (err, doc) => cb(err, doc === null ? undefined : doc));
    }));
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
        dataElementModel.updateOne({_id: cde._id}, {$inc: {views: threshold}}).exec();
    }
}

export function create(elt: DataElement, user: User, callback: CbError1<DataElementDocument>) {
    wipeDatatype(elt);
    elt.created = Date.now();
    elt.createdBy = {
        userId: user._id,
        username: user.username,
    };
    const newItem = new dataElementModel(elt);
    newItem.tinyId = generateTinyId();
    newItem.save((err, newElt) => {
        callback(err, newElt);
        if (!err) {
            auditModificationsDe(user, null, newElt);
        }
    });
}

export function update(elt: DataElementDraft, user: User, options: UpdateEltOptions = {}): Promise<DataElement> {
    return dataElementModel.findById(elt._id, null, null)
        .then(dataElement => {
            /* istanbul ignore if */
            if (!dataElement) {
                throw new Error('Document Not Found');
            }
            /* istanbul ignore if */
            if (dataElement.archived) {
                throw new Error('You are trying to edit an archived element');
            }
            delete elt._id;
            /* istanbul ignore if */
            if (!elt.history) {
                elt.history = [];
            }
            elt.history.push(dataElement._id);
            updateUser(elt, user);

            // user cannot edit sources.
            if (!options.updateSource) {
                elt.sources = dataElement.sources;
            }

            // because it's draft not edit attachment
            if (!options.updateAttachments) {
                elt.attachments = dataElement.attachments;
            }

            // created & createdBy cannot be changed.
            elt.created = dataElement.created;
            elt.createdBy = dataElement.createdBy;

            const newElt = new dataElementModel(elt);

            // archive dataElement and replace it with newElt
            return dataElementModel.findOneAndUpdate(
                {
                    _id: dataElement._id,
                    archived: false
                },
                {$set: {archived: true}},
                null
            )
                .then(oldElt => {
                    /* istanbul ignore if */
                    if (!oldElt) {
                        throw new Error('Document not found');
                    }
                    return newElt.save().then(
                        savedElt => {
                            auditModificationsDe(user, dataElement, savedElt);
                            return savedElt;
                        },
                        err => dataElementModel.findOneAndUpdate({_id: dataElement._id}, {$set: {archived: false}})
                            .then(() => Promise.reject(err))
                    );
                });
        });
}

export function derivationByInputs(inputTinyId: string, cb: CbError1<DataElementDocument[]>) {
    dataElementModel.find({archived: false, 'derivationRules.inputs': inputTinyId}).exec(cb);
}

export function findModifiedElementsSince(date: Date | string | number, cb: CbError1<DataElementDocument[]>) {
    dataElementModel.aggregate([
        {
            $match: {
                archived: false,
                updated: {$gte: date},
            },
        },
        {$limit: 2000},
        {$sort: {updated: -1}},
        {$group: {_id: '$tinyId'}} as any,
    ], cb);

}

export function originalSourceByTinyIdSourceName(tinyId: string, sourceName: string, cb: CbError1<DataElementDocument>) {
    dataElementSourceModel.findOne({tinyId, source: sourceName}, cb);
}

function updateUser(elt: DataElement, user: User) {
    wipeDatatype(elt);
    elt.updated = new Date();
    elt.updatedBy = {
        userId: user._id,
        username: user.username,
    };
}
