import * as mongoose from 'mongoose';
import { Document, Model, Schema } from 'mongoose';
import { deleteBoardById, updateOrInsertBoardById } from 'server/board/elastic';
import { handleErrorVoid } from 'server/errorHandler/errorHandler';
import { establishConnection } from 'server/system/connections';
import { objectId } from 'server/system/mongo-data';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { config } from 'server/system/parseConfig';
import { Board, CbError1 } from 'shared/models.model';

addStringtype(mongoose);
const StringType = (Schema.Types as any).StringType;

export type BoardDocument = Document & Board;

const conn = establishConnection(config.database.appData);
// for DAO manager
export const type = 'board';
export const name = 'Boards';

const pinSchema = new Schema({
    tinyId: StringType,
    type: {type: StringType, default: 'cde', enum: ['cde', 'form']},
    pinnedDate: Date,
}, {_id: false});

const pinningBoardSchema = new Schema({
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

pinningBoardSchema.pre('save', function(next) {
    const id = this._id.toString();
    const board = this.toObject();
    delete board._id;
    updateOrInsertBoardById(id, board, handleErrorVoid({
        publicMessage: 'Unable to index board: ' + id
    }, () => next()));
});

pinningBoardSchema.pre('remove', function(next) {
    const id = this._id.toString();
    deleteBoardById(id, handleErrorVoid({
        publicMessage: 'Unable to remove board: ' + id,
    }, () => next()));
});

pinningBoardSchema.virtual('elementType').get(() => 'board');
pinningBoardSchema.set('collection', 'pinningBoards');
export const pinningBoardModel: Model<BoardDocument> = conn.model('PinningBoard', pinningBoardSchema);
export const dao = pinningBoardModel;

// for Elastic reindex
export function getStream(condition: any) {
    return pinningBoardModel.find(condition).sort({_id: -1}).cursor();
}

export function count(condition: any, callback: CbError1<number>): void {
    pinningBoardModel.countDocuments(condition, callback);
}

export function nbBoardsByUserId(userId: string) {
    return pinningBoardModel.countDocuments({'owner.userId': userId});
}

export function byId(boardId: string, callback?: CbError1<BoardDocument>): Promise<BoardDocument | null> {
    return pinningBoardModel.findById(boardId).exec(callback as any);
}

export function byIdAndOwner(boardId: string, ownerId: string): Promise<BoardDocument | null> {
    return pinningBoardModel.findOne({_id: objectId(boardId), 'owner.userId': ownerId}).exec();
}

export function newBoard(board: Board): Promise<BoardDocument> {
    return (new pinningBoardModel(board).save as any)();
}
