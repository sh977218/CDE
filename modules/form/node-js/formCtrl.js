var mongo_data_form = require('./mongo-form')
    , mongo_data_cde = require('../../cde/node-js/mongo-cde')
    , adminSvc = require('../../system/node-js/adminItemSvc.js')
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

    var findAllCdesInFormElement = function (node, map, array) {
        if (node.formElements) {
            for (var i = 0; i < node.formElements.length; i++) {
                if (node.formElements[i].elementType === "question") {
                    map[node.formElements[i].question.cde.tinyId] = node.formElements[i].question.cde;
                    array.push(node.formElements[i].question.cde.tinyId);
                }
                findAllCdesInFormElement(node.formElements[i], map, array);
            }
        }
    };
    var markCDE = function (form, cb) {
        var allTinyId = [];
        var allCdes = {};
        findAllCdesInFormElement(form, allCdes, allTinyId);
        mongo_data_cde.findCurrCdesInFormElement(allTinyId, function (error, currCdes) {
            var currCdeMap = {};
            for (var i = 0; i < currCdes.length; i++) {
                var currCde = currCdes[i];
                currCdeMap[currCde['tinyId']] = currCde['version'];
            }
            for (var tinyId in allCdes) {
                var cde = allCdes[tinyId];
                var version = cde['version'];
                var currVersion = currCdeMap[tinyId];
                if (version !== currVersion)
                    cde['outdated'] = true;
            }
            if (cb) cb();
        });
    }
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
