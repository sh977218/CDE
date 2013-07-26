var mongo_data = require('./mongo-data')
    , util = require('util')
    ;
    
    
exports.managedRegAuths = function(req, res) {
    mongo_data.managedRegAuths(function(regAuths) {
        res.send({"regAuths": regAuths});
    });
};

exports.addRegAuth = function(req, res) {
    mongo_data.addRegAuth(req.body.name, res);
};

exports.removeRegAuth = function(req, res) {
    mongo_data.removeRegAuth(req.body.id, function () {
        res.send("RegAuth Removed");
    });
};
