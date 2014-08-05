var mongo_data = require('./mongo-data');

exports.renderListPage = function(req, res) {
    res.render('list', 'form');
};

exports.findForms = function(req, res) {
    mongo_data.findForms(req.body.criteria, function(err, forms) {
        res.send(forms);
    });
};