import { Document, Model } from 'mongoose';
import { CbError1, ModuleAll } from 'shared/models.model';

declare interface DaoModule<T extends Document> {
    _model: Model<T>;
    byKey(id: string): Promise<T | null>;
    byKey(id: string, cb: CbError1<T | null>): void;
    type: ModuleAll;
}
