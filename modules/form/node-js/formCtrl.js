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

//exports.findAllCdesInForm = function (node, map, array) {
//    if (node.formElements) {
//        for (var i = 0; i < node.formElements.length; i++) {
//            if (node.formElements[i].elementType === "question") {
//                map[node.formElements[i].question.cde.tinyId] = node.formElements[i].question.cde;
//                array.push(node.formElements[i].question.cde.tinyId);
//            }
//            exports.findAllCdesInForm(node.formElements[i], map, array);
//        }
//    }
//};

//var getFormQuestions = function(form){
//    var getQuestions = function(fe){
//        var qs = [];
//        fe.formElements.forEach(function(e){
//            if (e.elementType === 'question') qs.push(e.question);
//            else qs = qs.concat(getQuestions(e));
//        });
//        return qs;
//    };
//    return getQuestions(form);
//};

exports.formById = function (req, res) {
    var markCDE = function (form, cb) {
        var cdes = formShared.getFormQuestions(form).map(function(c){
            return c.cde;
        });
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
