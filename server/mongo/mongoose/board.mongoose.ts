import { ObjectId } from 'mongodb';
import { Cursor, Document, Model, QueryOptions } from 'mongoose';
import { config } from 'server';
import { boardSchema } from 'server/mongo/mongoose/schema/board.schema';
import { establishConnection } from 'server/system/connections';
import { Board as BoardClient } from 'shared/board.model';

export type Board = BoardClient;
export type BoardDocument = Document<ObjectId, {}, Board> & Board;

const conn = establishConnection(config.database.appData);
export const boardModel: Model<Board> = conn.model('PinningBoard', boardSchema);

export function getStream(condition: any): Cursor<BoardDocument, QueryOptions<Board>> {
    return boardModel.find(condition).sort({ _id: -1 }).cursor();
}
