import { Dictionary } from 'async';
import * as boardDb from 'server/board/boardDb';
import * as mongoDe from 'server/cde/mongo-cde';
import * as mongoForm from 'server/form/mongo-form';
import { ModuleAll } from 'shared/models.model';

// @ts-ignore
export type DAOs = mongoDe | mongoForm | boardDb;

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
