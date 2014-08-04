var express = require('express')
  , path = require('path')
  , formListCtrl = require('./formListCtrl')
;

exports.init = function(app) {

    app.use("/form/public", express.static(path.join(__dirname, '../public')));
    
    app.get('/formList', formListCtrl.renderListPage);
    
    app.get('/forms', formListCtrl.getForms);

};