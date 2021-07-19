import { Dictionary } from 'async';
import { ItemDao } from 'server/system/itemDao';
import { Elt, Item, ItemElastic, ModuleItem } from 'shared/models.model';

export type DAO = ItemDao<Item, ItemElastic>;

const daoList: DAO[] = [];
const allDaos: Dictionary<DAO> = {};

export function registerItemDao<T extends Elt>(dao: ItemDao<T, T>): void {
    daoList.push(dao as any);
    allDaos[dao.type] = dao as any;
}

export function getItemDaoList(): DAO[] {
    return daoList;
}

export function getItemDao(type: ModuleItem): DAO {
    return allDaos[type];
}
