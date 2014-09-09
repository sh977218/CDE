var mongo_data = require('./mongo-data')
    , util = require('util')
    ;
    
    
exports.managedOrgs = function(req, res) {
    mongo_data.managedOrgs(function(orgs) {
        res.send({"orgs": orgs});
    });
};

exports.addOrg = function(req, res) {
    mongo_data.addOrg(req.body, res);
};

exports.removeOrg = function(req, res) {
    mongo_data.removeOrg(req.body.id, function () {
        res.send("Org Removed");
    });
};

exports.updateOrg = function(req, res) {
    mongo_data.updateOrg(req.body, res);
};
