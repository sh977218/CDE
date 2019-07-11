import * as mongoose from 'mongoose';
import { establishConnection } from '../system/connections';
import { addStringtype } from '../system/mongoose-stringtype';
import { config } from '../system/parseConfig';
import { CbError } from 'shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;
const conn = establishConnection(config.database.appData);

export const fs_files = new Schema({
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
export const Fs_files = conn.model('fs_files', fs_files);

export function alterAttachmentStatus(id: mongoose.Schema.Types.ObjectId, status: string, callback: CbError) {
    Fs_files.updateOne({_id: id}, {$set: {'metadata.status': status}}, callback);
}
