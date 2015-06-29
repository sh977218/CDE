var  path = require('path')
    , express = require('express')
    , config = require('../../system/node-js/parseConfig')
    , mongo = require('./mongo_article')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
    , authorization = require('../../system/node-js/authorization')
    , authorizationShared = require('../../system/shared/authorizationShared')
    , multer  = require('multer')
;

exports.init = function(app) {    

    app.get("/article/key/:key", function(req, res) {
        mongo.byKey(req.params.key, function(err, result) {
            if (err) res.status(404).end();
            else if (!result) res.status(404).end();
            else res.send(result);
        });
    });
    
    app.get("/article/id/:id", function(req, res) {
        mongo.byId(req.params.id, function(err, result) {
            if (err) res.status(404).end();
            else if (!result) res.status(404).end();
            else res.send(result);
        });
    });
    
    app.post("/article/key/:key", function(req, res) {
        if (authorizationShared.hasRole(req.user, "DocumentationEditor")) {
            if (!req.body.key) {
                mongo.newArticle(req.params.key, function(err, newArticle) {
                    if (err) res.status(400).end();
                    else res.send(newArticle);
                });
            } else {
                mongo.update(req.body, function(err, newArticle) {
                    if (err) res.status(400).end();
                    else res.send(newArticle);                
                });
            }
        } else {
            res.status(403).send("Not Authorized");
        }
    });
  
    app.post('/attachments/article/add', multer(config.multer), function(req, res) {
        if (authorizationShared.hasRole(req.user, "DocumentationEditor")) {
            mongo.byId(req.body.id, function(err, elt) {
                if (err) res.status(404).end();
                else {
                    mongo_data_system.addAttachment(req.files.uploadedFiles, req.user, "some comment", elt, function() {
                        res.send(elt);            
                    });                
                }
            });
        }
    });

    app.post('/attachments/article/remove', function(req, res) {
        if (authorizationShared.hasRole(req.user, "DocumentationEditor")) {
            mongo.byId(req.body.id, function(err, elt) {
                if (err) res.status(404).end();
                else {
                    elt.attachments.splice(req.body.index, 1);
                    elt.save(function (err) {
                        if (err) {
                            res.status(500).end();
                        } else {
                            res.send(elt);
                        }
                    });
                }
            });
        }
    });
};