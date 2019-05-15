let daoList = [];
let allDaos = {};

const errorHandler = require("../errorHandler/errHandler");
const consoleLog = errorHandler.consoleLog;
const handleError = errorHandler.handleError;

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