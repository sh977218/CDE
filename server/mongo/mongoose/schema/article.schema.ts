import { Schema } from 'mongoose';
import { Article } from 'server/mongo/mongoose/article.mongoose';
import { attachmentSchema } from 'server/system/schemas';

export const articleSchema = new Schema<Article>(
    {
        key: { type: String, index: true },
        body: String,
        created: { type: Date, default: new Date() },
        updated: { type: Date, default: new Date() },
        active: { type: Boolean, default: false },
        attachments: [attachmentSchema],
    },
    {}
);
