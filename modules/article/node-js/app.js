var  path = require('path')
    , express = require('express')
    , mongo = require('./mongo_article');
;

exports.init = function(app) {    
    app.use("/article/public", express.static(path.join(__dirname, '../public')));
    
    app.get("/article/:key", function(req, res) {
        mongo.byKey(req.params.key, function(err, result) {
            if (err) res.send(404);
            else if (!result) res.send(404);
            else res.send(result);
        });
    });
    
    app.post("/article/:key", function(req, res) {
        if (!req.body.key) {
            mongo.newArticle(req.params.key, function(err, newArticle) {
                if (err) res.send(400);
                else res.send(newArticle);
            });
        } else {
            mongo.update(req.body, function(err, nbAffected) {
                if (err) res.send(400);
                else res.send("OK");                
            });
        }
    });
    
};