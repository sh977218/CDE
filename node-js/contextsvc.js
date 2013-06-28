var mongo_data = require('./mongo-data')
    , util = require('util')
    ;
    
    
exports.managedContexts = function(req, res) {
    mongo_data.managedContexts(function(contexts) {
        res.send({"contexts": contexts});
    });
};

exports.addContext = function(req, res) {
    mongo_data.addContext(req.body.name, res);
};

exports.removeContext = function(req, res) {
    mongo_data.removeContext(req.body.id, function () {
        res.send("Context Removed");
    });
};
