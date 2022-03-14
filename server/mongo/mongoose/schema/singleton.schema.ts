import { Schema } from 'mongoose';
import { ObjectId } from 'server';

export const singletonSchema = new Schema({
    _id: String,
    body: Schema.Types.Mixed,
    updated: {type: Number, default: 0, required: true},
    updatedBy: {type: ObjectId, required: true},
    updateInProgress: Schema.Types.Mixed,
}, {collection: 'singleton', versionKey: 'updated'});
