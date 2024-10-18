import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { addStringtype } from 'server/system/mongoose-stringtype';

addStringtype(mongoose);
const StringType = (Schema.Types as any).StringType;

const pinSchema = new Schema(
    {
        tinyId: StringType,
        type: { type: StringType, default: 'cde', enum: ['cde', 'form'] },
        pinnedDate: Date,
    },
    { _id: false }
);

export const boardSchema = new Schema(
    {
        name: StringType,
        description: StringType,
        type: { type: StringType, default: 'cde', enum: ['cde', 'form'] },
        tags: [StringType],
        shareStatus: StringType,
        createdDate: Date,
        updatedDate: Date,
        owner: {
            userId: Schema.Types.ObjectId,
            username: StringType,
        },
        pins: [pinSchema],
        users: [
            {
                username: StringType,
                role: { type: StringType, default: 'viewer', enum: ['viewer'] }, // ??? 'reviewer'
                lastViewed: Date,
            },
        ],
    },
    {
        toObject: {
            virtuals: true,
        },
        toJSON: {
            virtuals: true,
        },
    }
);

boardSchema.virtual('elementType').get(() => 'board');
boardSchema.set('collection', 'pinningBoards');
