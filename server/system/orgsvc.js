var mongo_data = require('./mongo-data')
    , daoManager = require('./moduleDaoManager')
    , async = require('async')
    ;
const authorizationShared = require('@std/esm')(module)("../../shared/system/authorizationShared");

exports.managedOrgs = function(req, res) {
    mongo_data.managedOrgs(function(orgs) {
        res.send({"orgs": orgs});
    });
};

exports.addOrg = function(req, res) {
    var newOrg = req.body;
    if (newOrg.workingGroupOf) {
        mongo_data.orgByName(newOrg.workingGroupOf, function (err, parentOrg) {
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

exports.transferSteward = function(req, res) {
    var results = [];
    var hasError = false;
    
    if(req.isAuthenticated() && authorizationShared.isOrgAdmin(req.user, req.body.from) && authorizationShared.isOrgAdmin(req.user, req.body.to)) {
        async.each(daoManager.getDaoList(), function(dao, oneDone) {
            if (dao.transferSteward) {
                dao.transferSteward(req.body.from, req.body.to, function(err, result) {
                    if(err || Number.isNaN(result)) {
                        hasError = true;
                        results.push( 'Error transferring ' + dao.name + ' from ' + req.body.from + ' to ' + req.body.to + '. Please try again. ');
                    } else if(result === 0) {
                        results.push( 'There are no ' + dao.name + ' to transfer. ');
                    } else {
                        results.push(result + ' ' + dao.name + ' transferred. ');
                    }
                    oneDone();
                });
            } else oneDone();
        }, function allDone() {
            return res.status(hasError? 400 : 200).send(results.join(''));
        });
    } else {
        res.status(400).send("Please login first.");
    }
};