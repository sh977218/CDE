import * as mongoose from 'mongoose';
import { Document, Model } from 'mongoose';
import { config, ObjectId } from 'server';
import { establishConnection } from 'server/system/connections';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { ClassificationAudit } from 'shared/audit/classificationAudit';
import { CbError1 } from 'shared/models.model';
import { orderedList } from 'shared/regStatusShared';

type ClassificationAuditDocument = Document<ObjectId, {}, ClassificationAudit> & ClassificationAudit;

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const conn = establishConnection(config.database.appData);

export const classificationAuditSchema = new Schema({
    date: {type: Date, default: Date.now, index: true}, user: {
        username: StringType
    },
    elements: [{
        tinyId: StringType,
        version: StringType,
        _id: Schema.Types.ObjectId,
        name: StringType,
        status: {type: StringType, enum: orderedList},
        eltType: {type: StringType, enum: ['cde', 'form']},
    }],
    newname: StringType,
    action: {type: StringType, enum: ['add', 'delete', 'rename', 'reclassify']},
    path: [StringType]
}, {collection: 'classificationAudit'});

const classificationAuditModel: Model<ClassificationAuditDocument>
    = conn.model('classificationAudit', classificationAuditSchema);

export function saveClassificationAudit(msg: ClassificationAudit, callback: CbError1<ClassificationAuditDocument> = () => {}) {
    new classificationAuditModel(msg).save(callback);
}

export function classificationAuditPagination({skip, limit, sort}: { limit: number, skip: number, sort?: string }) {
    return classificationAuditModel
        .find({}, {elements: {$slice: 10}})
        .sort(sort)
        .skip(skip)
        .limit(limit);
}
