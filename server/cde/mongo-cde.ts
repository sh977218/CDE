import * as Ajv from 'ajv';
import { isEmpty } from 'lodash';
import { Document, Model, QueryCursor } from 'mongoose';
import { updateOrInsert } from 'server/cde/elastic';
import { auditSchema, dataElementSchema, dataElementSourceSchema, draftSchema } from 'server/cde/schemas';
import { splitError } from 'server/errorHandler/errorHandler';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { attachables, auditGetLog, auditModifications, formatElt, generateTinyId } from 'server/system/mongo-data';
import { config } from 'server/system/parseConfig';
import * as dataElementschema from 'shared/de/assets/dataElement.schema.json';
import { DataElement as DataElementClient, DataElementElastic } from 'shared/de/dataElement.model';
import { wipeDatatype } from 'shared/de/deValidator';
import { CbErr, CbError, CbError1, EltLog, User } from 'shared/models.model';
import { isOrgCurator } from 'shared/system/authorizationShared';
import { Dictionary } from 'async';

export const type = 'cde';
export const name = 'CDEs';
export const elastic = require('../../server/cde/elastic');

export type DataElement = DataElementClient;
export type DataElementDocument = Document & DataElement;
export type DataElementDraft = DataElement;
export type DataElementDraftDocument = Document & DataElementDraft;
export type DataElementSource = DataElement;
export type DataElementSourceDocument = Document & DataElementSource;
export type EltLogDocument = Document & EltLog;

const ajvElt = new Ajv({allErrors: true});
ajvElt.addSchema(require('../../shared/de/assets/adminItem.schema'));
export let validateSchema: any;
try {
    const schema = dataElementschema;
    (schema as any).$async = true;
    validateSchema = validateSchema = ajvElt.compile(schema);
} catch (err) {
    console.log('Error: dataElement.schema.json does not compile. ' + err);
    process.exit(1);
}

dataElementSchema.pre('save', function preSaveUseThisForSomeReason(next) {
    const elt = this as DataElementDocument;

    if (elt.archived) {
        return next();
    }
    validateSchema(elt).then(() => {
        try {
            updateOrInsert(elt);
        } catch (exception) {
            errorLogger.error(`Error Indexing CDE ${elt.tinyId}`, {
                details: exception,
                stack: new Error().stack
            });
        }

        const valueDomain = elt.valueDomain;
        if (valueDomain.datatype === 'Value List' && isEmpty(valueDomain.permissibleValues)) {
            next(new Error('Value List with empty permissible values.'));
        } else {
            next();
        }
    }, (err: string) => {
        next(new Error(`Cde ${elt.tinyId} has error: ${err}`));
    });
});

const conn = establishConnection(config.database.appData);
const cdeAuditModel: Model<EltLogDocument> = conn.model('CdeAudit', auditSchema);
export const dataElementModel: Model<DataElementDocument> = conn.model('DataElement', dataElementSchema);
export const dataElementDraftModel: Model<DataElementDraftDocument> = conn.model('DataElementDraft', draftSchema);
export const dataElementSourceModel: Model<DataElementSourceDocument> = conn.model('DataElementSource', dataElementSourceSchema);

const auditModificationsDe = auditModifications(cdeAuditModel);
export const getAuditLog = auditGetLog(cdeAuditModel);
export const dao = dataElementModel;
export const daoDraft = dataElementDraftModel;

attachables.push(dataElementModel);

function updateUser(elt: DataElement, user: User) {
    wipeDatatype(elt);
    elt.updated = new Date();
    elt.updatedBy = {
        userId: user._id,
        username: user.username,
    };
}

export function byExisting(elt: DataElement, cb: CbError<DataElementDocument>) {
    dataElementModel.findOne({_id: elt._id, tinyId: elt.tinyId}, cb);
}

export function byId(id: string, cb: CbError<DataElementDocument>) {
    dataElementModel.findOne({_id: id}, cb);
}

export function byTinyId(tinyId: string, cb: CbError<DataElementDocument>) {
    return dataElementModel.findOne({tinyId, archived: false}, cb);
}

export function latestVersionByTinyId(tinyId: string, cb: CbError<string>) {
    dataElementModel.findOne({tinyId, archived: false}, (err, dataElement) => {
        cb(err, dataElement ? dataElement.version : undefined);
    });
}

export function byTinyIdList(tinyIdList: string[], cb: CbError<DataElementElastic[]>): void {
    dataElementModel.find({archived: false}).where('tinyId')
        .in(tinyIdList)
        .slice('valueDomain.permissibleValues', 10)
        .exec((err, docs) => {
            if (err) {
                return cb(err);
            }
            const cdes = docs.map<DataElementElastic>(formatElt);
            cb(err, tinyIdList.map(t => cdes.filter(cde => cde.tinyId === t)[0]).filter(cde => !!cde));
        });
}

export function draftByTinyId(tinyId: string, cb: CbError<DataElementDraftDocument>) {
    const cond = {
        archived: false,
        tinyId,
    };
    dataElementDraftModel.findOne(cond, cb);
}

export function draftById(id: string, cb: CbError<DataElementDraftDocument>) {
    const cond = {
        _id: id,
    };
    dataElementDraftModel.findOne(cond, cb);
}

export function draftSave(elt: DataElement, user: User, cb: CbError<DataElementDocument>): void {
    updateUser(elt, user);
    dataElementDraftModel.findById(elt._id, splitError(cb, doc => {
        if (!doc) {
            new dataElementDraftModel(elt).save(cb);
            return;
        }
        if (doc.__v !== elt.__v) {
            return cb();
        }
        const version = elt.__v;
        elt.__v++;
        dataElementDraftModel.findOneAndUpdate({_id: elt._id, __v: version}, elt, {new: true},
            (err, doc) => cb(err, doc === null ? undefined : doc));
    }));
}

export function draftDelete(tinyId: string, cb: CbError<DataElementDraftDocument>) {
    dataElementDraftModel.remove({tinyId}, cb);
}

export function draftsList(criteria: any): Promise<DataElementDraftDocument[]>;
export function draftsList(criteria: any, cb: CbError<DataElementDraftDocument>): void;
export function draftsList(criteria: any, cb?: CbError<DataElementDraftDocument>): void | Promise<DataElementDraftDocument[]> {
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

/* ---------- PUT NEW REST API Implementation above  ---------- */

export function getStream(condition: any): QueryCursor<DataElementDocument> {
    return dataElementModel.find(condition).sort({_id: -1}).cursor();
}

export function count(condition: any, callback: CbError<number>) {
    return dataElementModel.countDocuments(condition, callback);
}

export function byTinyIdVersion(tinyId: string, version: string | undefined, cb: CbError<DataElementDocument>) {
    if (version) {
        byTinyIdAndVersion(tinyId, version, cb);
    } else {
        byTinyId(tinyId, cb);
    }
}

export function byTinyIdAndVersion(tinyId: string, version: string | undefined, callback: CbError<DataElementDocument>) {
    const _query: any = {tinyId};
    if (version) {
        _query.version = version;
    } else {
        _query.$or = [{version: null}, {version: ''}];
    }
    dataElementModel.find(_query).sort({updated: -1}).limit(1).exec((err, elts) => {
        callback(err, elts[0]);
    });
}

export function eltByTinyId(tinyId: string, callback: CbError<DataElementDocument>) {
    dataElementModel.findOne({
        archived: false,
        tinyId,
    }, callback);
}

const viewedCdes: Dictionary<number> = {};
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

export function update(elt: DataElementDraft, user: User, options: any = {},
                       callback: CbError<DataElement>): void {
    dataElementModel.findById(elt._id, (err, dataElement) => {
        if (err || !dataElement) {
            return callback(new Error('Document Not Found'));
        }
        if (dataElement.archived) {
            return callback(new Error('You are trying to edit an archived elements'));
        }
        delete elt._id;
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
        if (options.updateAttachments) {
            elt.attachments = dataElement.attachments;
        }

        const newElt = new dataElementModel(elt);

        // archive dataElement and replace it with newElt
        dataElementModel.findOneAndUpdate({
            _id: dataElement._id,
            archived: false
        }, {$set: {archived: true}}, (err, doc) => {
            if (err || !doc) {
                return callback(err, doc || undefined);
            }
            newElt.save((err, savedElt) => {
                if (err) {
                    dataElementModel.findOneAndUpdate({_id: dataElement._id}, {$set: {archived: false}},
                        () => callback(err));
                } else {
                    callback(undefined, savedElt);
                    auditModificationsDe(user, dataElement, savedElt);
                }
            });
        });
    });
}

export function derivationOutputs(inputTinyId: string, cb: CbError<DataElementDocument[]>) {
    dataElementModel.find({archived: false, 'derivationRules.inputs': inputTinyId}).exec(cb);
}

export function findModifiedElementsSince(date: Date | string | number, cb: CbError<DataElementDocument[]>) {
    dataElementModel.aggregate([
        {
            $match: {
                archived: false,
                updated: {$gte: date},
            },
        },
        {$limit: 2000},
        {$sort: {updated: -1}},
        {$group: {_id: '$tinyId'}},
    ]).exec(cb);

}

export function originalSourceByTinyIdSourceName(tinyId: string, sourceName: string, cb: CbError<DataElementDocument>) {
    dataElementSourceModel.findOne({tinyId, source: sourceName}, cb);
}
