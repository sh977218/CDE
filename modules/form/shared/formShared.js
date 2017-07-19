var async = require('async'),
    mongo_form = require('../node-js/mongo-form')
;

exports.getFormQuestions = function (form) {
    var getQuestions = function (fe) {
        var qs = [];
        if (fe.formElements) {
            fe.formElements.forEach(function (e) {
                if (e.elementType === 'question') qs.push(e.question);
                else qs = qs.concat(getQuestions(e));
            });
        }
        return qs;
    };
    return getQuestions(form);
};

exports.getFormCdes = function (form) {
    return exports.getFormQuestions(form).map(function (q) {
        return q.cde;
    });
};

exports.fetchWholeForm = function (Form, callback) {
    var maxDepth = 8;
    var depth = 0;
    var form = JSON.parse(JSON.stringify(Form));
    var loopFormElements = function (form, cb) {
        if (form.formElements) {
            async.forEach(form.formElements, function (fe, doneOne) {
                if (fe.elementType === 'form') {
                    depth++;
                    if (depth < maxDepth) {
                        mongo_form.byTinyIdAndVersion(fe.inForm.form.tinyId, fe.inForm.form.version, function (err, result) {
                            result = result.toObject();
                            fe.formElements = result.formElements;
                            loopFormElements(fe, function () {
                                depth--;
                                doneOne();
                            });
                        });
                    } else {
                        doneOne();
                    }
                } else if (fe.elementType === 'section') {
                    loopFormElements(fe, function () {
                        doneOne();
                    });
                } else {
                    doneOne();
                }
            }, function doneAll() {
                cb();
            });
        }
        else {
            cb();
        }
    };
    loopFormElements(form, function () {
        if (form.toObject) form = form.toObject();
        callback(form);
    });
};
