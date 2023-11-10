import { Schema } from 'mongoose';
import { attachmentSchema } from 'server/system/schemas';

export const articleSchema = new Schema({
    key: {type: String, index: true},
    body: String,
    created: {type: Date, default: new Date()},
    updated: {type: Date, default: new Date()},
    active: {type: Boolean, default: false},
    attachments: [attachmentSchema]
}, {});
