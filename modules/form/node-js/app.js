var express = require('express')
  , path = require('path')
;

exports.init = function(app) {

    app.use("/form/public", express.static(path.join(__dirname, '../public')));
    
    app.get('/formList', function(req, res) {
        res.render('list', 'form');
    });

};