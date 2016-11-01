var mongo_data = require('./mongo-data')
    , util = require('util')
    , daoManager = require('./moduleDaoManager')
    , usersrvc = require('./usersrvc')
    , async = require('async')
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
    var results = [];
    var hasError = false;
    
    if(req.isAuthenticated() && usersrvc.isAdminOf(req.user, req.body.from) && usersrvc.isAdminOf(req.user, req.body.to)) {
        async.each(daoManager.getDaoList(), function(dao, oneDone) {
            if (dao.transferSteward) {
                dao.transferSteward(req.body.from, req.body.to, function(err, result) {
                    if(err || Number.isNaN(result)) {
                        hasError = true;
                        results.push({status: 400, message: 'Error transferring ' + dao.name + ' from ' + req.body.from + ' to ' + req.body.to + '. Please try again. '});
                    } else if(result === 0) {
                        results.push({status: 200, message: 'There are no ' + dao.name + ' to transfer. '});
                    } else {
                        results.push({status: 200, message: result + ' ' + dao.name + ' transferred. '});
                    }
                    oneDone();
                });
            } else oneDone();
        }, function allDone() {
            if(results.length===daoManager.getDaoList().length) {
                return res.status(hasError === true ? 400 : 200).send(results.map(r=>r.messgae).join(''));
            }
        });
    } else {
        res.status(400).send("Please login first.");
    }
};
