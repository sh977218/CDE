import * as mongoose from 'mongoose';
import { config } from 'server/system/parseConfig';
import { handleError } from 'server/errorHandler/errorHandler';
import { ObjectId } from 'server/system/mongo-data';
import { establishConnection } from 'server/system/connections';

import { deleteBoardById, updateOrInsertBoardById } from 'server/board/elastic';

const Schema = mongoose.Schema;

const conn = establishConnection(config.database.appData);
// for DAO manager
export const type = 'board';

let pinSchema = {
    tinyId: String,
    type: {type: String, default: 'cde', enum: ['cde', 'form']},
    pinnedDate: Date,
};

let pinningBoardSchema = new Schema({
    name: String,
    description: String,
    type: {type: String, default: 'cde', enum: ['cde', 'form']},
    tags: [String],
    shareStatus: String,
    createdDate: Date,
    updatedDate: Date,
    owner: {
        userId: Schema.Types.ObjectId,
        username: String
    },
    pins: [pinSchema],
    users: [{
        username: String,
        role: {type: String, default: 'viewer', enum: ['viewer']},
        lastViewed: Date,
    }],
}, {
    usePushEach: true, toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

pinningBoardSchema.pre('save', function (next) {
    let id = this._id.toString();
    let board = this.toObject();
    delete board._id;
    updateOrInsertBoardById(id, board, handleError({
        publicMessage: 'Unable to index board: ' + id
    }, () => next()));
});

pinningBoardSchema.pre('remove', function (next) {
    let id = this._id.toString();
    deleteBoardById(id, handleError({
        publicMessage: 'Unable to remove board: ' + id,
    }, () => next()));
});

pinningBoardSchema.virtual('elementType').get(() => 'board');
pinningBoardSchema.set('collection', 'pinningBoards');
export const PinningBoard = conn.model('PinningBoard', pinningBoardSchema);
export const dao = PinningBoard;

// for Elastic reindex
export function getStream(condition) {
    return PinningBoard.find(condition).sort({_id: -1}).cursor();
}

export function count(condition, callback) {
    PinningBoard.countDocuments(condition, callback);
}

export function publicBoardsByPinTinyId(tinyId) {
    return PinningBoard.find({'pins.tinyId': tinyId, shareStatus: 'Public'});
}

export function nbBoardsByUserId(userId) {
    return PinningBoard.countDocuments({'owner.userId': userId});
}

export function boardById(boardId) {
    return PinningBoard.findById(boardId);
}

export function byIdAndOwner(boardId, ownerId) {
    return PinningBoard.findOne({_id: ObjectId(boardId), 'owner.userId': ownerId}).exec();
}

export const byId = boardById;

export function newBoard(board) {
    return new PinningBoard(board).save();
}
