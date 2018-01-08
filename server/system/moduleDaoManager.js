var daoList = [];
var allDaos = {};

exports.registerDao = function(dao) {
    daoList.push(dao);
    allDaos[dao.type] = dao;
};

exports.getDaoList = function() {
    return daoList;
};

exports.getDao = function (type) {
    return allDaos[type];
};