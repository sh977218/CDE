var express = require('express')
  , path = require('path')
  , formCtrl = require('./formCtrl')
  , sharedElastic = require('../../system/node-js/elastic.js')
;

exports.init = function(app) {

    app.use("/form/public", express.static(path.join(__dirname, '../public')));

    app.post('/findForms', formCtrl.findForms);
    
    app.post('/form', formCtrl.save);
    
    app.post('/attachments/form/remove', function(req, res) {
        checkCdeOwnership(req.body.deId, req, function(err, de) {
            if (err) return res.send(err);  
            de.attachments.splice(req.body.index, 1);
            de.save(function (err) {
               if (err) {
                   res.send("error: " + err);
               } else {
                   res.send(de);
               }
            });
        });
    });
    
    app.post('/attachments/form/setDefault', function(req, res) {
        checkCdeOwnership(req.body.deId, req, function(err, de) {
            if (err) {
                logging.expressLogger.info(err);
                return res.send(err);
            }  
            var state = req.body.state;
            for (var i = 0; i < de.attachments.length; i++) {
                de.attachments[i].isDefault = false;
            }
            de.attachments[req.body.index].isDefault = state;
            de.save(function (err) {
               if (err) {
                   res.send("error: " + err);
               } else {
                   res.send(de);
               }
            });
        });
    });

    app.get('/formById/:id/:type', formCtrl.formById);
    
    app.post('/elasticSearch/form', function(req, res) {
       sharedElastic.elasticsearch(req.body.query, 'form', function(result) {
           res.send(result);
       }); 
    });    

};