var express = require('express')
  , path = require('path')
  , formCtrl = require('./formCtrl')
  , sharedElastic = require('../../system/node-js/elastic.js')
  , mongo_data = require('./mongo-form')
  , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
  , config = require('config')
  , multer  = require('multer')
;

exports.init = function(app, daoManager) {
    daoManager.registerDao(mongo_data);

    app.post('/findForms', formCtrl.findForms);
    
    app.post('/form', formCtrl.save);
    app.get('/form/:id', formCtrl.formById);

    if (config.modules.forms.attachments) {
        app.post('/attachments/form/setDefault', function(req, res) {
            adminItemSvc.setAttachmentDefault(req, res, mongo_data);
        });

        app.post('/attachments/form/add', multer(), function(req, res) {
            adminItemSvc.addAttachment(req, res, mongo_data);
        });

        app.post('/attachments/form/remove', function(req, res) {
            adminItemSvc.removeAttachment(req, res, mongo_data);
        });
    }
    
    app.get('/formById/:id/:type', formCtrl.formById);

    app.get('/formbytinyid/:id/:version', function(req, res) {
        res.send("");
    });
    
    app.post('/elasticSearch/form', function(req, res) {
       sharedElastic.elasticsearch(req.body.query, 'form', function(err, result) {
           if (err) return res.status(400).end();
           res.send(result);
       }); 
    });    

    if (config.modules.forms.comments) {
        app.post('/comments/form/add', function(req, res) {
            adminItemSvc.addComment(req, res, mongo_data);
        });

        app.post('/comments/form/remove', function(req, res) {
            adminItemSvc.removeComment(req, res, mongo_data);
        });
        
        app.post('/comments/form/approve', function(req, res) {
            adminItemSvc.approveComment(req, res, mongo_data);
        });          
    }

    app.get('/form/properties/keys', function(req, res) {
        adminItemSvc.allPropertiesKeys(req, res, mongo_data);
    });

};