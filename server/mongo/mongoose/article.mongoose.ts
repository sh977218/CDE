import { Document, Model } from 'mongoose';
import { config } from 'server';
import { articleSchema } from 'server/mongo/mongoose/schema/article.schema';
import { establishConnection } from 'server/system/connections';
import { Article } from 'shared/article/article.model';

export type ArticleDocument = Document & Article;

const conn = establishConnection(config.database.appData);
export const articleModel: Model<ArticleDocument> = conn.model('article', articleSchema) as any;
