var mongo_data = require('./mongo-data')
    , util = require('util')
    ;
    
exports.register = function(req, res) {    
    mongo_data.userByName(req.body.username, function(err, found) {
        if (found) {
            res.send("user already exists");
        } else {
            console.log(req.body);
            var user = {username: req.body.username
                        , password: req.body.password};
            mongo_data.addUser(user, function() {
                res.send("Thank you for registering");
            });
        }
    });
};
