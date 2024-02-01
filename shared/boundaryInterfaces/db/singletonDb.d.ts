import { ObjectId } from 'shared/models.model';
import { SingletonServer as Singleton } from 'shared/singleton.model';

export interface SingletonDb {
    byId(_id: string): Promise<Singleton | null>;

    deleteOneById(_id: string): Promise<void>;

    exists(query: any): Promise<boolean>;

    startEdit(_id: string, user: ObjectId): Promise<Singleton | null>;

    update(_id: string, query: {}, userId: ObjectId, setClause: {}): Promise<Singleton>;
}
