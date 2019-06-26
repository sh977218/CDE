import { capString } from '../../shared/system/util';

const daoList: any = [];
const allDaos: any = {};

export function registerDao(dao) {
    daoList.push(dao);
    allDaos[dao.type] = dao;
}

export function getDaoList() {
    return daoList;
}

export function getDao(type) {
    return allDaos[type];
}
