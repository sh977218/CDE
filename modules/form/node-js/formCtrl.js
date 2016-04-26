var mongo_data_form = require('./mongo-form'),
    mongo_data_cde = require('../../cde/node-js/mongo-cde'),
    adminSvc = require('../../system/node-js/adminItemSvc.js'),
    formShared = require('../shared/formShared'),
    JXON = require('jxon'),
    sdc = require('./sdcForm'),
    redCap = require('./redCapForm'),
    Archiver = require('archiver')
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
                        if (formCde.version !== systemCde.version) {
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
    adminSvc.hideUnapprovedComments(form);
    var resForm = form.toObject();
    markCDE(resForm, function () {
        res.send(resForm);
    });
};

var getFormPlainXml = function (form, req, res) {
    mongo_data_form.eltByTinyId(req.params.id, function (err, form) {
        if (!form) return res.status(404).end();
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

exports.formById = function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    mongo_data_form.eltByTinyId(req.params.id, function (err, form) {
        if (err || !form) return res.status(404).end();
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
        else if (req.query.type === 'redCap') getFormRedCap(form, req, res);
        else getFormJson(form, req, res);
    });
};

var getFormSdc = function (form, req, res) {
    res.setHeader("Content-Type", "application/xml");
    res.send(sdc.formToSDC(form));
};

var getFormRedCap = function (form, req, res) {
    if (form.stewardOrg.name === 'PhenX') {
        res.send('warning', 'You can download PhenX RedCap from <a class="alert-link" href="https://www.phenxtoolkit.org/index.php?pageLink=rd.ziplist">here</a>.');
    }
    if (form.stewardOrg.name === 'PROMIS / Neuro-QOL') {
        res.send('warning', 'You can download PROMIS / Neuro-QOL RedCap from <a class="alert-link" href="http://project-redcap.org/">here</a>.');
    }

    res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-disposition': 'attachment; filename=' + form.naming[0].designation + '.zip'
    });
    var zip = Archiver('zip');
    zip.append('NLM', {name: 'AuthorID.txt'})
        .append(form.tinyId, {name: 'InstrumentID.txt'})
        .append(redCap.formToRedCap(form), {name: 'instrument.csv'})
        .finalize();
    zip.pipe(res);
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
