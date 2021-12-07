import { Document, Model, QueryCursor } from 'mongoose';
import { config } from 'server';
import { boardSchema } from 'server/mongo/mongoose/schema/board.schema';
import { establishConnection } from 'server/system/connections';
import { Board } from 'shared/models.model';

export type BoardDocument = Document & Board;

const conn = establishConnection(config.database.appData);
export const boardModel: Model<BoardDocument> = conn.model('PinningBoard', boardSchema);

export function getStream(condition: any): QueryCursor<BoardDocument> {
    return boardModel.find(condition).sort({_id: -1}).cursor();
}
