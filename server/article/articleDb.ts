import { Document, Model, Schema } from 'mongoose';
import { establishConnection } from 'server/system/connections';
import { attachables } from 'server/system/mongo-data';
import { config } from 'server/system/parseConfig';
import { attachmentSchema } from 'server/system/schemas';
import { Article } from 'shared/article/article.model';
import { CbError1 } from 'shared/models.model';

const conn = establishConnection(config.database.appData);
const articleSchema = new Schema({
    key: {type: String, index: true},
    body: String,
    created: {type: Date, default: new Date()},
    updated: {type: Date, default: new Date()},
    attachments: [attachmentSchema]
}, {usePushEach: true});
export type ArticleDocument = Document & Article;
const articleModel: Model<ArticleDocument> = conn.model('article', articleSchema);

attachables.push(articleModel);

export const type = 'articles';

export function byId(id: string, cb: CbError1<ArticleDocument>) {
    articleModel.findOne({_id: id}, cb);
}

export async function byKey(key: string) {
    return articleModel.findOne({key});
}

export async function update(art: Article) {
    return articleModel.findOneAndUpdate(
        {key: art.key},
        {$set: {body: art.body, updated: new Date()}},
        {upsert: true, new: true}
    );
}
