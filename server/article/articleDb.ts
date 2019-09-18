import { Schema } from 'mongoose';
import { establishConnection } from 'server/system/connections';
import { attachables } from '../system/mongo-data';
import { config } from '../system/parseConfig';
import { attachmentSchema } from '../system/schemas';

const conn = establishConnection(config.database.appData);
const Article = conn.model('article', new Schema({
    key: {type: String, index: true},
    body: String,
    created: {type: Date, default: new Date()},
    updated: {type: Date, default: new Date()},
    attachments: [attachmentSchema]
}, {usePushEach: true}));

attachables.push(Article);

export const type = 'articles';

export function byId(id, cb) {
    Article.findOne({_id: id}, cb);
}

export function byKey(key, cb) {
    Article.findOne({key}, cb);
}

export function update(art, cb) {
    Article.findOneAndUpdate({key: art.key}, {$set: {body: art.body, updated: Date.now()}}, {upsert: true}, cb);
}
