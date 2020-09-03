import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { ObjectId } from 'server';
import { establishConnection } from 'server/system/connections';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { config } from 'server/system/parseConfig';
import { CbError } from 'shared/models.model';

addStringtype(mongoose);
const StringType = (mongoose.Schema.Types as any).StringType;
const conn = establishConnection(config.database.appData);

export const fsFilesSchema = new Schema({
    _id: Schema.Types.ObjectId,
    filename: StringType,
    contentType: StringType,
    length: Number,
    chunkSize: Number,
    uploadDate: Date,
    aliases: StringType,
    metadata: {
        status: StringType
    },
    md5: StringType
}, {collection: 'fs.files'});
export const fsFilesModel = conn.model('fs_files', fsFilesSchema);

export function alterAttachmentStatus(id: ObjectId, status: string, callback: CbError) {
    fsFilesModel.updateOne({_id: id}, {$set: {'metadata.status': status}}, callback);
}
