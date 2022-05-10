import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { AttachableDb } from 'server/mongo/base/attachableDb';
import { CrudHooks, PromiseOrValue } from 'server/mongo/base/baseDb';
import { ArticleDocument, articleModel } from 'server/mongo/mongoose/article.mongoose';
import { Article } from 'shared/article/article.model';
import { ArticleDb } from 'shared/boundaryInterfaces/db/articleDb';
import { Attachment } from 'shared/models.model';

const articleHooks: CrudHooks<Article, ObjectId> = {
    read: {
        post: (article) => article,
    },
    save: {
        pre: (article) => article,
        post: (article) => article,
    },
    delete: {
        pre: (_id) => _id,
        post: (_id) => {},
    },
};

class ArticleDbMongo extends AttachableDb<Article, ObjectId> implements ArticleDb {
    constructor(model: Model<ArticleDocument>) {
        super(model, articleHooks, 'updated');
    }

    attach(id: string, attachment: Attachment): Promise<Article | null> {
        return this.attachmentAdd(new ObjectId(id), attachment);
    }

    byId(id: string): Promise<Article | null> {
        return this.findOneById(new ObjectId(id));
    }

    byKey(key: string): Promise<Article | null> {
        return this.findOne({key});
    }

    exists(query: any): Promise<boolean> {
        return super.exists(query);
    }

    removeAttachment(id: string, attachmentIndex: number): Promise<Article | null> {
        return this.attachmentRemove(new ObjectId(id), attachmentIndex);
    }

    setDefaultAttachment(id: string, attachmentIndex: number, state: boolean): Promise<Article | null> {
        return this.attachmentSetDefault(new ObjectId(id), attachmentIndex, state);
    }

    update(article: Article): Promise<Article> {
        return this.model.findOneAndUpdate(
            {key: article.key},
            {$set: {body: article.body, updated: new Date()}},
            {upsert: true, new: true}
        )
            .then(newArticle => newArticle.toObject<Article>())
            .then(article => (this.hooks.save.post as (a: Article) => PromiseOrValue<Article>)(article)); // TODO: TypeScript/issues/37181
    }
}

export const articleDb = new ArticleDbMongo(articleModel);
