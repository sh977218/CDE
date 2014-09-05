var daoManager = this;

this.daoList = [];

exports.registerDao = function(dao) {
    daoManager.daoList.push(dao);
};

exports.getDaoList = function() {
    return daoManager.daoList;
};