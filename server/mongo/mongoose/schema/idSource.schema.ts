import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { IdSource } from 'server/mongo/mongoose/idSource.mongoose';
import { addStringtype } from 'server/system/mongoose-stringtype';

addStringtype(mongoose);
const StringType = (Schema.Types as any).StringType;

export const idSourceSchema = new Schema<IdSource>(
    {
        _id: String,
        linkTemplateDe: { type: StringType, default: '' },
        linkTemplateForm: { type: StringType, default: '' },
        version: StringType,
    },
    { collection: 'idSource' }
);
