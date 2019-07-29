import * as mongoose from 'mongoose';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { config } from 'server/system/parseConfig';
import { handleError } from 'server/errorHandler/errorHandler';
import { ObjectId } from 'server/system/mongo-data';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

const elastic = require('./elastic');

// for DAO manager
export const type = 'board';

let pinSchema = {
    tinyId: StringType,
    type: {type: StringType, default: 'cde', enum: ['cde', 'form']},
    pinnedDate: Date,
};

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
    elastic.updateOrInsertBoardById(id, board, handleError({
        publicMessage: 'Unable to index board: ' + id
    }, () => next()));
});

pinningBoardSchema.pre('remove', function (next) {
    let id = this._id.toString();
    elastic.deleteBoardById(id, handleError({
        publicMessage: 'Unable to remove board: ' + id,
    }, () => next()));
});

pinningBoardSchema.virtual('elementType').get(() => 'board');
pinningBoardSchema.set('collection', 'pinningBoards');
export const PinningBoard = conn.model('PinningBoard', pinningBoardSchema);
export const dao = PinningBoard;


export function getStream(condition) {
    return PinningBoard.find(condition).sort({_id: -1}).cursor();
}

export function count(condition, callback) {
    PinningBoard.countDocuments(condition, callback);
}

export function publicBoardsByPinTinyId(tinyId, callback) {
    PinningBoard.find({'pins.tinyId': tinyId, shareStatus: 'Public'}, callback);
}

export function nbBoardsByUserId(userId, callback) {
    PinningBoard.countDocuments({'owner.userId': userId}, callback);
}

export function boardById(boardId, callback) {
    PinningBoard.findById(boardId, callback);
}

export function byIdAndOwner(boardId, ownerId) {
    return new Promise((res,rej)=>{
        rej('wrong');
    })
//    throw new Error('wrong');
//    return PinningBoard.findOne({_id: ObjectId(boardId), 'owner.userId': ownerId}).exec();
}

export const byId = boardById;

export function newBoard(board, callback) {
    return new PinningBoard(board).save(callback);
}
