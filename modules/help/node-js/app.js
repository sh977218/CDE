var  path = require('path')
    , express = require('express')
;

exports.init = function(app) {    
    app.use("/help/public", express.static(path.join(__dirname, '../public')));
};