var mongo_data_form = require('./mongo-form'),
    mongo_data_cde = require('../../cde/node-js/mongo-cde'),
    adminSvc = require('../../system/node-js/adminItemSvc.js'),
    formShared = require('../shared/formShared'),
    JXON = require('jxon'),
    sdc = require('./sdcForm'),
    redCap = require('./redCapForm'),
    archiver = require('archiver'),
    async = require('async'),
    authorization = require('../../system/node-js/authorization')
    ;

exports.findForms = function (req, res) {
    mongo_data_form.findForms(req.body.criteria, function (err, forms) {
        res.send(forms);
    });
};

exports.save = function (req, res) {
    adminSvc.save(req, res, mongo_data_form);
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

var getFormJson = function (form, req, res) {
    var markCDE = function (form, cb) {
        var cdes = formShared.getFormCdes(form);
        var ids = cdes.map(function (cde) {
            return cde.tinyId;
        });
        mongo_data_cde.findCurrCdesInFormElement(ids, function (error, currCdes) {
            cdes.forEach(function (formCde) {
                currCdes.forEach(function (systemCde) {
                    if (formCde.tinyId === systemCde.tinyId) {
                        if (formCde.version != systemCde.version) {
                            formCde.outdated = true;
                            form.outdated = true;
                        }
                        formCde.derivationRules = systemCde.derivationRules;
                    }
                });
            });
            if (cb) cb();
        });
    };
    if (!req.user) adminSvc.hideProprietaryIds(form);
    var resForm = form.toObject();
    markCDE(resForm, function () {
        res.send(resForm);
    });
};

var getFormPlainXml = function (form, req, res) {
    mongo_data_form.eltByTinyId(req.params.id, function (err, form) {
        if (!form) return res.status(404).end();
        if (!req.user) adminSvc.hideProprietaryIds(form);
        res.setHeader("Content-Type", "application/xml");
        var exportForm = form.toObject();
        delete exportForm._id;
        exportForm.formElements.forEach(function (s) {
            s.formElements.forEach(function (q) {
                delete q._id;
            });
        });
        res.send(JXON.jsToString({element: exportForm}));
    });
};

function wipeRenderDisallowed (form, req, cb) {
    if (form && form.noRenderAllowed) {
        authorization.checkOwnership(mongo_data_form, form._id, req, function(err, isYouAllowed) {
            if (!isYouAllowed) form.formElements = [];
            cb();
        });
    } else {
        cb();
    }
}

exports.formById = function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    mongo_data_form.eltByTinyId(req.params.id, function (err, form) {
        if (err || !form) return res.status(404).end();
        if (!req.user) adminSvc.hideProprietaryIds(form);
        wipeRenderDisallowed(form, req, function() {
            if (req.query.type === 'xml' && req.query.subtype === 'odm') {
                formShared.getFormOdm(form, function (err, xmlForm) {
                    if (err) res.status(err).send(xmlForm);
                    else {
                        res.set('Content-Type', 'text/xml');
                        res.send(JXON.jsToString({element: xmlForm}));
                    }
                });
            }
            else if (req.query.type === 'xml' && req.query.subtype === 'sdc') getFormSdc(form, req, res);
            else if (req.query.type === 'xml') getFormPlainXml(form, req, res);
            else if (req.query.type && req.query.type.toLowerCase() === 'redcap') getFormRedCap(form.toObject(), res);
            else getFormJson(form, req, res);
        });
    });
};

exports.formByTinyIdVersion = function (req, res) {
    if (req.params.version !== 'undefined') {
        mongo_data_form.byTinyIdAndVersion(req.params.id, req.params.version, function (err, elt) {
            if (err) res.status(500).send(err);
            else {
                if (!req.user) adminSvc.hideProprietaryIds(elt);
                wipeRenderDisallowed(elt, req, function() {
                    res.send(elt);
                });
            }
        });
    } else {
        mongo_data_form.eltByTinyId(req.params.id, function (err, elt) {
            if (err) res.status(500).send(err);
            else {
                if (!req.user) adminSvc.hideProprietaryIds(elt);
                wipeRenderDisallowed(elt, req, function() {
                    res.send(elt);
                });
            }
        });
    }
};


exports.fetchWholeForm = function(Form, callback) {
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
        if (form.toObject()) form = form.toObject();
        callback(form);
    });
};

exports.wholeFormById = function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    mongo_data_form.eltByTinyId(req.params.id, function (err, form) {
        exports.fetchWholeForm(form, function (f) {
            if (!req.user) adminSvc.hideProprietaryIds(f);
            res.send(f);
        });
    });
};

var getFormSdc = function (form, req, res) {
    res.setHeader("Content-Type", "application/xml");
    exports.fetchWholeForm(form, function (wholeForm) {
        if (!req.user) adminSvc.hideProprietaryIds(wholeForm);
        sdc.formToSDC(wholeForm, req.query.renderer, function (txt) {res.send(txt);});
    });
};

var exportWarnings = {
    'PhenX': 'You can download PhenX REDCap from <a class="alert-link" href="https://www.phenxtoolkit.org/index.php?pageLink=rd.ziplist">here</a>.',
    'PROMIS / Neuro-QOL': 'You can download PROMIS / Neuro-QOL REDCap from <a class="alert-link" href="http://project-redcap.org/">here</a>.',
    'emptySection': 'REDCap cannot support empty section.',
    'nestedSection': 'REDCap cannot support nested section.',
    'unknownElementType': 'This form has error.'
};

function loopForm(form) {
    function loopFormElements(fe, insideSection) {
        for (var i = 0; i < fe.formElements.length; i++) {
            var e = fe.formElements[i];
            if (e.elementType === 'section') {
                if (insideSection === true) {
                    return 'nestedSection';
                }
                else if (e.formElements.length === 0) {
                    return 'emptySection';
                }
                else {
                    return loopFormElements(e, true);
                }
            } else if (e.elementType !== 'question') {
                console.log('unknown element type in form: ' + form);
                return 'unknownElementType';
            }
        }
        return false;
    }

    return loopFormElements(form, false);
}

var getFormRedCap = function (form, response) {
    if (exportWarnings[form.stewardOrg.name]) {
        response.status(202).send(exportWarnings[form.stewardOrg.name]);
        return;
    }
    var validationErr = loopForm(form);
    if (validationErr) {
        response.status(500).send(exportWarnings[validationErr]);
    } else {
        response.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-disposition': 'attachment; filename=' + form.naming[0].designation + '.zip'
        });
        var zip = archiver('zip', {});
        zip.on('error', function (err) {
            response.status(500).send({error: err.message});
        });

        //on stream closed we can end the request
        zip.on('end', function () {
            console.log('Archive wrote %d bytes', zip.pointer());
        });
        zip.pipe(response);
        zip.append('NLM', {name: 'AuthorID.txt'})
            .append(form.tinyId, {name: 'InstrumentID.txt'})
            .append(redCap.formToRedCap(form), {name: 'instrument.csv'})
            .finalize();
    }
};

exports.priorForms = function (req, res) {
    var formId = req.params.id;

    if (!formId) {
        res.send("No Form Id");
    }
    mongo_data_form.priorForms(formId, function (err, priorForms) {
        if (err) {
            res.send("ERROR");
        } else {
            res.send(priorForms);
        }
    });
};

