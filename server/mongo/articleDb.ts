import { Document, Model, Schema } from 'mongoose';
import { attachmentAdd, attachmentRemove, attachmentSetDefault } from 'server/mongo/shared/attachable';
import { byId } from 'server/mongo/shared/mongoUtils';
import { establishConnection } from 'server/system/connections';
import { config } from 'server/system/parseConfig';
import { attachmentSchema } from 'server/system/schemas';
import { Article } from 'shared/article/article.model';
import { ArticleDb } from 'shared/boundaryInterfaces/db/articleDb';
import { Attachment } from 'shared/models.model';

type ArticleDocument = Document & Article;

const conn = establishConnection(config.database.appData);
const articleSchema = new Schema({
    key: {type: String, index: true},
    body: String,
    created: {type: Date, default: new Date()},
    updated: {type: Date, default: new Date()},
    attachments: [attachmentSchema]
}, {usePushEach: true});
const articleModel: Model<ArticleDocument> = conn.model('article', articleSchema);

class ArticleDbMongo implements ArticleDb {
    attach(_id: string, attachment: Attachment): Promise<Article> {
        return attachmentAdd(articleModel, _id, attachment);
    }

    byId(_id: string): Promise<Article | null> {
        return byId(articleModel, _id);
    }

    byKey(key: string): Promise<Article | null> {
        return articleModel.findOne({key})
            .then(doc => doc && doc.toObject());
    }

    removeAttachment(_id: string, attachmentIndex: number): Promise<Article> {
        return attachmentRemove(articleModel, _id, attachmentIndex);
    }

    setDefaultAttachment(_id: string, attachmentIndex: number, state: boolean): Promise<Article> {
        return attachmentSetDefault(articleModel, _id, attachmentIndex, state);
    }

    update(article: Article): Promise<void> {
        return articleModel.findOneAndUpdate(
            {key: article.key},
            {$set: {body: article.body, updated: new Date()}},
            {upsert: true, new: true}
        )
            .then(() => {});
    }
}

export const articleDb = new ArticleDbMongo();
