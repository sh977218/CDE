var mongo_data_form = require('./mongo-form')
    , mongo_data_cde = require('../../cde/node-js/mongo-cde')
    , adminSvc = require('../../system/node-js/adminItemSvc.js')
    , formShared = require('../shared/formShared')
    ;

exports.findForms = function (req, res) {
    mongo_data_form.findForms(req.body.criteria, function (err, forms) {
        forms.forEach(exports.hideUnapprovedComments);
        res.send(forms);
    });
};

exports.save = function (req, res) {
    adminSvc.save(req, res, mongo_data_form);
};

exports.formById = function (req, res) {
    var markCDE = function (form, cb) {
        var cdes = formShared.getFormCdes(form);
        var ids = cdes.map(function(cde){
            return cde.tinyId;
        });
        mongo_data_cde.findCurrCdesInFormElement(ids, function (error, currCdes) {
            cdes.forEach(function(formCde){
                currCdes.forEach(function(systemCde){
                    if (formCde.tinyId === systemCde.tinyId) {
                        if (formCde.version !== systemCde.version) {
                            formCde.outdated = true;
                        }
                        formCde.derivationRules = systemCde.derivationRules;
                        //formCde.naming = systemCde.naming;
                    }
                });
            });
            if (cb) cb();
        });
    };
    var type = req.query.type === 'tinyId' ? 'eltByTinyId' : 'byId';
    mongo_data_form[type](req.params.id, function (err, form) {
        if (form) {
            adminSvc.hideUnapprovedComments(form);
            var resForm = form.toObject();
            markCDE(resForm, function () {
                res.send(resForm);
            });
        } else {
            res.status(404).end();
        }
    });
};

//exports.formById = function (req, res) {
//    var markCDE = function (form, cb) {
//        var allTinyId = [];
//        var allCdes = {};
//        exports.findAllCdesInForm(form, allCdes, allTinyId);
//        mongo_data_cde.findCurrCdesInFormElement(allTinyId, function (error, currCdes) {
//            var currCdeMap = {};
//            for (var i = 0; i < currCdes.length; i++) {
//                var currCde = currCdes[i];
//                currCdeMap[currCde['tinyId']] = currCde.toObject();
//            }
//            for (var tinyId in allCdes) {
//                if (currCde) {
//                    var cde = allCdes[tinyId];
//                    var version = cde.version;
//                    var currCde = currCdeMap[tinyId];
//                    var currVersion = currCde.version;
//                    if (version !== currVersion) {
//                        cde.outdated = true;
//                        form.outdated = true;
//                    }
//                    cde.derivationRules = currCde.derivationRules;
//                } else {
//                    // @TODO can replace with cde.missing (or something like that)
//                    cde.outdated = true;
//                }
//            }
//
//            if (cb) cb();
//        });
//    };
//    var type = req.query.type === 'tinyId' ? 'eltByTinyId' : 'byId';
//    mongo_data_form[type](req.params.id, function (err, form) {
//        if (form) {
//            adminSvc.hideUnapprovedComments(form);
//            var resForm = form.toObject();
//            markCDE(resForm, function () {
//                res.send(resForm);
//            });
//        } else {
//            res.status(404).end();
//        }
//    });
//};
