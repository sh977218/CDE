import * as mongoose from 'mongoose';
import { Document, Model } from 'mongoose';
import { config, ObjectId } from 'server';
import { establishConnection } from 'server/system/connections';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { CbError1 } from 'shared/models.model';
import { orderedList } from 'shared/regStatusShared';
import {ClassificationAuditLog} from "shared/log/audit";

type ClassificationAuditDocument = Document<ObjectId, {}, ClassificationAuditLog> & ClassificationAuditLog;

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

export const classificationAuditModel: Model<ClassificationAuditDocument>
    = conn.model('classificationAudit', classificationAuditSchema);

export function saveClassificationAudit(msg: ClassificationAuditLog, callback: CbError1<ClassificationAuditDocument> = () => {}) {
    new classificationAuditModel(msg).save(callback);
}
