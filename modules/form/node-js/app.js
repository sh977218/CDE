var express = require('express')
  , path = require('path')
  , formCtrl = require('./formCtrl')
;

exports.init = function(app) {

    app.use("/form/public", express.static(path.join(__dirname, '../public')));

    app.post('/findForms', formCtrl.findForms);
    
    app.post('/createForm', formCtrl.createForm);

};