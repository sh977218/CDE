import { Dictionary } from 'async';
import { Document } from 'mongoose';
import { BoardDocument } from 'server/board/boardDb';
import { DaoModule } from 'server/system/moduleDao';
import { ItemDocument } from 'server/system/mongo-data';
import { ModuleAll } from 'shared/models.model';

type DAO = DaoModule<ItemDocument | BoardDocument>;

const daoList: DAO[] = [];
const allDaos: Dictionary<DAO> = {};

export function registerDao<T extends ItemDocument | BoardDocument>(dao: DaoModule<T>): void {
    daoList.push(dao);
    allDaos[dao.type] = dao;
}

export function getDaoList(): DAO[] {
    return daoList;
}

export function getDao(type: ModuleAll): DAO {
    return allDaos[type];
}
