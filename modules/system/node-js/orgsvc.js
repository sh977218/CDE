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

    var results = [];
    var hasError = false;
    
    if(req.isAuthenticated() && usersrvc.isAdminOf(req.user, req.body.from) && usersrvc.isAdminOf(req.user, req.body.to)) {
        daoManager.getDaoList().forEach(function(dao) {
            dao.transferSteward(req.body.from, req.body.to, function(err, result) {

                if(err || Number.isNaN(result)) {
                    hasError = true;
                    results.push({status: 400, message: 'Error transferring ' + dao.name + ' from ' + req.body.from + ' to ' + req.body.to + '. Please try again. '});
                } else if(result===0) {
                    results.push({status: 200, message: 'There are no ' + dao.name + ' to transfer. '});
                } else {
                    results.push({status: 200, message: result + ' ' + dao.name + ' transferred. '});
                }
                
                if(results.length===daoManager.getDaoList().length) {
                    return res.send(hasError===true ? 400 : 200, concatResultsMessages(results) );                    
                }
            });
        });
    } else {
        res.send(400, "Please login first.");
    }
};

function concatResultsMessages( results ) {
    var finalMessage = '';
    
    for(var i=0; i<results.length; i++) {
        finalMessage += results[i].message;
    }
    
    return finalMessage;
}