import { Document, Model } from 'mongoose';
import { CbError1, Elt, ModuleItem } from 'shared/models.model';

declare interface ItemDao<T extends Elt, TElastic extends Elt> {
    _model: Model<T & Document>;
    byExisting(elt: T): Promise<T & Document | null>;
    byExisting(elt: T, cb: CbError1<T & Document | null>): void;
    byId(id: string): Promise<T & Document | null>;
    byId(id: string, cb: CbError1<T & Document | null>): void;
    byTinyId(tinyId: string): Promise<T & Document | null>;
    byTinyId(tinyId: string, cb: CbError1<T & Document | null>): void;
    byTinyIdAndVersion(tinyId: string, version: string | undefined): Promise<T & Document | null>;
    byTinyIdAndVersion(tinyId: string, version: string | undefined, cb: CbError1<T & Document | null>): void;
    byTinyIdListElastic(tinyIdList: string[], cb: CbError1<TElastic[] | void>): void;
    elastic: {
        byTinyIdList(idList: string[], size: number, cb: CbError1<TElastic[] | void>): void;
    };
    type: ModuleItem;
}
