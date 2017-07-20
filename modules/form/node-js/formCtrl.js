var mongo_data_form = require('./mongo-form'),
    async = require('async')
;

exports.findForms = function (req, res) {
    mongo_data_form.findForms(req.body.criteria, function (err, forms) {
        res.send(forms);
    });
};
exports.findAllCdesInForm = function (node, map, array) {
    if (node.formElements) {
        for (var i = 0; i < node.formElements.length; i++) {
            if (node.formElements[i].elementType === "question") {
                map[node.formElements[i].question.cde.tinyId] = node.formElements[i].question.cde;
                array.push(node.formElements[i].question.cde.tinyId);
            }
            exports.findAllCdesInForm(node.formElements[i], map, array);
        }
    }
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
                        mongo_data_form.byTinyIdAndVersion(fe.inForm.form.tinyId, fe.inForm.form.version, function (err, result) {
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


