import { Board, ObjectId } from 'shared/models.model';

export interface BoardDb {
    byId(id: string): Promise<Board | null>;

    byIdAndOwner(id: string, ownerId: string): Promise<Board | null>;

    byKey(key: string): Promise<Board | null>;

    count(query: any): Promise<number>;

    countByUser(userId: string): Promise<number>;

    deleteOneById(_id: ObjectId): Promise<void>;

    save(board: Board): Promise<Board>;
}
