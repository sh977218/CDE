import * as mongoose from 'mongoose';
import { config } from '../system/parseConfig';
import { addStringtype } from '../system/mongoose-stringtype';
import { orderedList } from 'shared/system/regStatusShared';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

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

const classificationAudit = conn.model('classificationAudit', classificationAuditSchema);

export function classificationAuditPagination({skip, limit, sort}) {
    return classificationAudit
        .find({}, {elements: {$slice: 10}})
        .sort(sort)
        .skip(skip)
        .limit(limit);
}
