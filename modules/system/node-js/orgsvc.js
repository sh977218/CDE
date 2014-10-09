var mongo_data = require('./mongo-data')
    , util = require('util')
    , daoManager = require('./moduleDaoManager')
    , usersrvc = require('./usersrvc')
    ;


exports.managedOrgs = function(req, res) {
    mongo_data.managedOrgs(function(orgs) {
        res.send({"orgs": orgs});
    });
};

exports.addOrg = function(req, res) {
    var newOrg = req.body;
    if (newOrg.workingGroupOf) {
        mongo_data.orgByName(newOrg.workingGroupOf, function(parentOrg) {
            newOrg.classifications = parentOrg.classifications;
            mongo_data.addOrg(newOrg, res);
        });
    } else {
        mongo_data.addOrg(newOrg, res);
    }
};

exports.removeOrg = function(req, res) {
    mongo_data.removeOrg(req.body.id, function () {
        res.send("Org Removed");
    });
};

exports.updateOrg = function(req, res) {
    mongo_data.updateOrg(req.body, res);
};

exports.transferSteward = function(req, res) {
    var cdeStatusCode = '';
    var formStatusCode = '';
    var cdeResMsg = '';
    var formResMsg = '';
    
    if(req.isAuthenticated() && usersrvc.isAdminOf(req.user, req.body.from) && usersrvc.isAdminOf(req.user, req.body.to)) {
        daoManager.getDaoList().forEach(function(dao) {
            dao.transferSteward(req.body.from, req.body.to, function(err, eleType, result) {
                var tempStatusCode = '';
                var tempResMsg = '';
                
                if(err || Number.isNaN(result)) {
                    tempStatusCode = 400;
                    tempResMsg = 'Error transferring ' + eleType + ' from ' + req.body.from + ' to ' + req.body.to + '. Please try again.';
                } else if(result===0) {
                    tempStatusCode = 200;
                    tempResMsg = 'There are no ' + eleType + ' to transfer.';
                } else {
                    tempStatusCode = 200;
                    tempResMsg = result + ' ' + eleType + ' transferred.';
                }
                
                if(eleType==='CDEs') {
                    cdeStatusCode = tempStatusCode;
                    cdeResMsg = tempResMsg;
                } else {
                    formStatusCode = tempStatusCode;
                    formResMsg = tempResMsg;
                }
                
                if(cdeStatusCode!=='' && formStatusCode!=='') {
                    return res.send(cdeStatusCode===400||formStatusCode===400 ? 400 : 200, cdeResMsg + ' ' + formResMsg);
                }
            });
        });
    } else {
        res.send(400, "Please login first.");
    }
};