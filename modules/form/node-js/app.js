var express = require('express')
  , path = require('path')
  , formCtrl = require('./formCtrl')
  , sharedElastic = require('../../system/node-js/elastic.js')
  , mongo_data = require('./mongo-form')
  , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
;

exports.init = function(app) {

    app.use("/form/public", express.static(path.join(__dirname, '../public')));

    app.post('/findForms', formCtrl.findForms);
    
    app.post('/form', formCtrl.save);
    app.get('/form/:id', formCtrl.formById);

    app.post('/attachments/form/setDefault', function(req, res) {
        adminItemSvc.setAttachmentDefault(req, res, mongo_data);
    });
    
    app.post('/attachments/form/add', function(req, res) {
        adminItemSvc.addAttachment(req, res, mongo_data);
    });

    app.post('/attachments/form/remove', function(req, res) {
        adminItemSvc.removeAttachment(req, res, mongo_data);
    });
    
    app.get('/formById/:id/:type', formCtrl.formById);
    
    app.post('/elasticSearch/form', function(req, res) {
       sharedElastic.elasticsearch(req.body.query, 'form', function(result) {
           res.send(result);
       }); 
    });    

};