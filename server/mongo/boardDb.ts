import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { deleteBoardById, updateOrInsertBoardById } from 'server/board/elastic';
import { respondError } from 'server/errorHandler';
import { BaseDb, CrudHooks, PromiseOrValue } from 'server/mongo/base/baseDb';
import { BoardDocument, boardModel } from 'server/mongo/mongoose/board.mongoose';
import { Board } from 'shared/board.model';
import { BoardDb } from 'shared/boundaryInterfaces/db/boardDb';
import { copyShallow } from 'shared/util';

const boardHooks: CrudHooks<Board, ObjectId> = {
    read: {
        post: (board) => {
            if (board) {
                board.elementType = 'board';
            }
            return board;
        },
    },
    save: {
        pre: (board) => {
            delete (board as any).elementType;
            return board;
        },
        post: (board): Board | null => {
            if (board) {
                const elasticBoard = copyShallow(board);
                delete elasticBoard._id;
                updateOrInsertBoardById(board._id.toString(), elasticBoard)
                    .catch(respondError({publicMessage: 'Unable to index board: ' + board._id}));
            }
            return board;
        },
    },
    delete: {
        pre: (_id) => _id,
        post: (_id) => {
            deleteBoardById(_id.toString())
                .catch(respondError({publicMessage: 'Unable to remove board: ' + _id}));
        },
    },
}

class BoardDbMongo extends BaseDb<Board, ObjectId> implements BoardDb {
    constructor(model: Model<BoardDocument>) {
        super(model, boardHooks, 'updatedDate');
    }

    byId(id: string): Promise<Board | null> {
        return this.findOneById(new ObjectId(id));
    }

    byIdAndOwner(id: string, ownerId: string): Promise<Board | null> {
        return this.findOne({_id: new ObjectId(id), 'owner.userId': ownerId});
    }

    byKey(key: string): Promise<Board | null> {
        return this.byId(key);
    }

    count(query: any): Promise<number> {
        return super.count(query);
    }

    countByUser(userId: string): Promise<number> {
        return this.count({'owner.userId': userId});
    }

    deleteOneById(_id: ObjectId): Promise<void> {
        return super.deleteOneById(_id);
    }

    save(board: Board): Promise<Board> {
        return Promise.resolve(this.hooks.save.pre(board))
            .then(board => this.model.findOneAndReplace({_id: new ObjectId(board._id)}, board, {new: true, upsert: true}))
            .then(doc => doc.toObject<Board>())
            .then(board => (this.hooks.save.post as (b: Board) => PromiseOrValue<Board>)(board)); // TODO: TypeScript/issues/37181
    }
}

export const boardDb = new BoardDbMongo(boardModel);
