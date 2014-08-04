var mongo_data = require('./mongo-data');

exports.renderListPage = function(req, res) {
    res.render('list', 'form');
};

exports.getForms = function() {
    
};