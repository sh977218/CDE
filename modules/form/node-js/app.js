var express = require('express')
  , path = require('path')
  , formCtrl = require('./formCtrl')
  , sharedElastic = require('../../system/node-js/elastic.js')
;

exports.init = function(app) {

    app.use("/form/public", express.static(path.join(__dirname, '../public')));

    app.post('/findForms', formCtrl.findForms);
    
    app.post('/form', formCtrl.save);
    
    app.get('/form/:id/:type', formCtrl.formById);
    
    app.post('/elasticSearch/form', function(req, res) {
       sharedElastic.elasticsearch(req.body.query, 'form', function(result) {
           res.send(result);
       }); 
    });    

};