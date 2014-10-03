var mongo_data = require('./mongo-data')
    , util = require('util')
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
            console.log(newOrg);
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
