import { Document, Schema } from 'mongoose';
import { establishConnection } from 'server/system/connections';
import { attachables } from 'server/system/mongo-data';
import { config } from 'server/system/parseConfig';
import { attachmentSchema } from 'server/system/schemas';
import { Article } from 'shared/article/article.model';
import { CbError } from 'shared/models.model';

export type ArticleDocument = Document & Article;

const conn = establishConnection(config.database.appData);
const articleModel = conn.model('article', new Schema({
    key: {type: String, index: true},
    body: String,
    created: {type: Date, default: new Date()},
    updated: {type: Date, default: new Date()},
    attachments: [attachmentSchema]
}, {usePushEach: true}));

attachables.push(articleModel);

export const type = 'articles';

export function byId(id: string, cb: CbError<ArticleDocument>) {
    articleModel.findOne({_id: id}, cb);
}

export function byKey(key: string, cb: CbError<ArticleDocument>) {
    articleModel.findOne({key}, cb);
}

export function update(art: any, cb: CbError<ArticleDocument>) {
    articleModel.findOneAndUpdate({key: art.key}, {$set: {body: art.body, updated: Date.now()}}, {upsert: true}, cb);
}
