import * as mongoose from 'mongoose';
import { addStringtype } from 'server/system/mongoose-stringtype';

import { Document, Model } from 'mongoose';
import { establishConnection } from 'server/system/connections';
import { config } from 'server/system/parseConfig';
import { ValidationWhitelist } from 'shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

export const validationWhitelistJson = {
    collectionName: {type: StringType, index: true, unique: true, description: 'Name of CDE load'},
    terms: {
        type: [StringType],
        description: 'Whitelisted terms',
        default: []
    }
}

export const validationWhitelistSchema = new Schema(validationWhitelistJson, {
    collection: 'validationwhitelist',
    usePushEach: true
});

const conn = establishConnection(config.database.appData);
export const validationWhitelistModel: Model<Document & ValidationWhitelist> = conn.model('ValidationWhitelist', validationWhitelistSchema);