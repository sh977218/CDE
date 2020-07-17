import { Dictionary } from 'async';
import { ModuleAll } from 'shared/models.model';

// export type DAOs = mongoDe | mongoForm | boardDb; TODO: export DAOs as objects instead of relying on the CommonJS exports object
export type DAOs = any;

const daoList: DAOs[] = [];
const allDaos: Dictionary<DAOs> = {};

export function registerDao(dao: DAOs) {
    daoList.push(dao);
    allDaos[dao.type] = dao;
}

export function getDaoList() {
    return daoList;
}

export function getDao(type: ModuleAll): DAOs {
    return allDaos[type];
}
