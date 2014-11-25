var  path = require('path')
    , express = require('express')
    , mongo = require('./mongo_article');
;

exports.init = function(app) {    
    app.use("/article/public", express.static(path.join(__dirname, '../public')));
    
    app.get("/help/topic/:id", function(req, res) {
        mongo.byPath("/help/topic/" + req.params.id, function(err, result) {
            console.log("back: " + err);
            console.log("result: " + result);
            if (err) res.send(404);
            else res.send(result);
        });
    });
};