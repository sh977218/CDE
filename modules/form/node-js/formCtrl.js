var mongo_data = require('./mongo-form')
    , adminSvc = require('../../system/node-js/adminItemSvc.js')
;

exports.findForms = function(req, res) {
    mongo_data.findForms(req.body.criteria, function(err, forms) {
        res.send(forms);
    });
};

exports.save = function(req, res) {
    // The following function fixes an issue of mongoose not enforcing object schema
    var removeSections = function(section) {
        if (section.skipLogic) {
            delete section.skipLogic.condition1;
            delete section.skipLogic.condition3;
        }
        if (section.formElements) section.formElements.forEach(function(s) {removeSections(s)});
    };
    removeSections(req.body);
    adminSvc.save(req, res, mongo_data);
};

exports.formById = function(req, res) {
    mongo_data.byId(req.params.id, function(err, form) {
        if (form) {
            res.send(form);
        } else {
            res.send(404);
        }
    });    
};