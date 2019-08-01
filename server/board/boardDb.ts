import * as mongoose from 'mongoose';
import { config } from 'server/system/parseConfig';
import { handleError } from 'server/errorHandler/errorHandler';
import { ObjectId } from 'server/system/mongo-data';
import { establishConnection } from 'server/system/connections';

import { deleteBoardById, updateOrInsertBoardById } from 'server/board/elastic';
import { addStringtype } from 'server/system/mongoose-stringtype';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const conn = establishConnection(config.database.appData);
// for DAO manager
export const type = 'board';

let pinSchema = new Schema({
    tinyId: StringType,
    type: {type: StringType, default: 'cde', enum: ['cde', 'form']},
    pinnedDate: Date,
});

let pinningBoardSchema = new Schema({
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
        role: {type: StringType, default: 'viewer', enum: ['viewer']},
        lastViewed: Date,
    }],
}, {
    usePushEach: true,
    toObject: {
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

export function byId(boardId, callback?) {
    return PinningBoard.findById(boardId).exec(callback);
}

export function byIdAndOwner(boardId, ownerId) {
    return PinningBoard.findOne({_id: ObjectId(boardId), 'owner.userId': ownerId}).exec();
}

export function newBoard(board) {
    return new PinningBoard(board).save();
}
