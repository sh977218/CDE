import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { deleteBoardById, updateOrInsertBoardById } from 'server/board/elastic';
import { respondError } from 'server/errorHandler';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { Board } from 'shared/board.model';

addStringtype(mongoose);
const StringType = (Schema.Types as any).StringType;

const pinSchema = new Schema({
    tinyId: StringType,
    type: {type: StringType, default: 'cde', enum: ['cde', 'form']},
    pinnedDate: Date,
}, {_id: false});

export const boardSchema = new Schema({
    name: StringType,
    description: StringType,
    type: {type: StringType, default: 'cde', enum: ['cde', 'form']},
    tags: [StringType],
    shareStatus: StringType,
    createdDate: Date,
    updatedDate: Date,
    owner: {
        userId: Schema.Types.ObjectId,
        username: StringType
    },
    pins: [pinSchema],
    users: [{
        username: StringType,
        role: {type: StringType, default: 'viewer', enum: ['viewer']}, // ??? 'reviewer'
        lastViewed: Date,
    }],
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

boardSchema.pre('save', function (next) {
    const id = this._id.toString();
    const board = this.toObject<Board>();
    delete board._id;
    updateOrInsertBoardById(id, board).then(() => next(), respondError({
        publicMessage: 'Unable to index board: ' + id
    }));
});

boardSchema.pre('remove', function (next) {
    const id = this._id.toString();
    deleteBoardById(id).then(() => next(), respondError({
        publicMessage: 'Unable to remove board: ' + id,
    }));
});

boardSchema.virtual('elementType').get(() => 'board');
boardSchema.set('collection', 'pinningBoards');
