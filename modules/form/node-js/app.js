var express = require('express')
  , path = require('path')
  , formListCtrl = require('./formListCtrl')
;

exports.init = function(app) {

    app.use("/form/public", express.static(path.join(__dirname, '../public')));
    
    app.get('/formListPage', formListCtrl.renderListPage);
    
    app.get('/createFormPage', formListCtrl.createFormPage);
    
    app.post('/findForms', formListCtrl.findForms);

};