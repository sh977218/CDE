var express = require('express')
    , path = require('path')
    , formCtrl = require('./formCtrl')
    , mongo_form = require('./mongo-form')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , classificationNode_system = require('../../system/node-js/classificationNode')
    , classificationShared = require('../../system/shared/classificationShared')
    , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
    , config = require('../../system/node-js/parseConfig')
    , multer = require('multer')
    , sdc = require('./sdcForm')
    , logging = require('../../system/node-js/logging')
    , elastic_system = require('../../system/node-js/elastic')
    , sharedElastic = require('../../system/node-js/elastic.js')
    , exportShared = require('../../system/shared/exportShared')
    , usersvc = require('../../system/node-js/usersvc')
    , usersrvc = require('../../system/node-js/usersrvc')
    ;

exports.init = function (app, daoManager) {
    daoManager.registerDao(mongo_form);

    app.post('/findForms', formCtrl.findForms);

    app.post('/form', formCtrl.save);
    app.get('/form/:id', exportShared.nocacheMiddleware, formCtrl.formById);
    app.get('/wholeForm/:id', exportShared.nocacheMiddleware, formCtrl.wholeFormById);

    app.use("/form/shared", express.static(path.join(__dirname, '../shared')));

    app.get('/elasticSearch/form/count', function (req, res) {
        return elastic_system.nbOfForms(function (err, result) {
            res.send("" + result);
        });
    });

    if (config.modules.forms.attachments) {
        app.post('/attachments/form/setDefault', function (req, res) {
            adminItemSvc.setAttachmentDefault(req, res, mongo_form);
        });

        app.post('/attachments/form/add', multer(config.multer), function (req, res) {
            adminItemSvc.addAttachment(req, res, mongo_form);
        });

        app.post('/attachments/form/remove', function (req, res) {
            adminItemSvc.removeAttachment(req, res, mongo_form);
        });
    }
    app.get('/priorforms/:id', exportShared.nocacheMiddleware, function (req, res) {
        formCtrl.priorForms(req, res);
    });
    app.get('/formById/:id', exportShared.nocacheMiddleware, formCtrl.formById);

    app.get('/formByTinyIdAndVersion/:id/:version', exportShared.nocacheMiddleware, formCtrl.formByTinyIdVersion);

    app.get('/sdcExportByTinyId/:tinyId/:version', exportShared.nocacheMiddleware, function (req, res) {
        mongo_form.byTinyIdAndVersion(req.params.tinyId, req.params.version, function (err, form) {
            if (err) {
                logging.errorLogger.error("Error: Cannot find element by tiny id.", {
                    origin: "system.adminItemSvc.approveComment",
                    stack: new Error().stack
                }, req);
                return res.status(500).send();
            } else {
                res.setHeader("Content-Type", "application/xml");
                sdc.formToSDC(form, null, function (txt) {res.send(txt);});
            }
        });
    });

    app.post('/elasticSearch/form', function (req, res) {
        var query = sharedElastic.buildElasticSearchQuery(req.user, req.body);
        sharedElastic.elasticsearch(query, 'form', function (err, result) {
            if (err) return res.status(400).send("invalid query");
            res.send(result);
        });
    });

    if (config.modules.cde.comments) {
        app.post('/comments/form/add', function (req, res) {
            adminItemSvc.addComment(req, res, mongo_form);
        });
        app.post('/comments/form/remove', function (req, res) {
            adminItemSvc.removeComment(req, res, mongo_form);
        });
    }

    app.post('/elasticSearchExport/form', function (req, res) {
        var query = sharedElastic.buildElasticSearchQuery(req.user, req.body);
        var exporters = {
            json: {
                export: function (res) {
                    var firstElt = true;
                    res.type('application/json');
                    res.write("[");
                    elastic_system.elasticSearchExport(function dataCb(err, elt) {
                        if (err) return res.status(500).send(err);
                        else if (elt) {
                            if (!firstElt) res.write(',');
                            elt = exportShared.stripBsonIds(elt);
                            elt = elastic_system.removeElasticFields(elt);
                            res.write(JSON.stringify(elt));
                            firstElt = false;
                        } else {
                            res.write("]");
                            res.send();
                        }
                    }, query, 'form');
                }
            }
        };
        exporters.json.export(res);
    });

    app.get('/formCompletion/:term', exportShared.nocacheMiddleware, function () {
        return [];
    });

    app.post('/pinFormCdes', function (req, res) {
        if (req.isAuthenticated()) {
            mongo_form.eltByTinyId(req.body.formTinyId, function (err, form) {
                if (form) {
                    var allCdes = {};
                    var allTinyIds = [];
                    formCtrl.findAllCdesInForm(form, allCdes, allTinyIds);
                    var fakeCdes = allTinyIds.map(function (_tinyId) {
                        return {tinyId: _tinyId};
                    });
                    usersvc.pinAllToBoard(req, fakeCdes, res);
                } else {
                    res.status(404).end();
                }
            });
        } else {
            res.send("Please login first.");
        }
    });

    app.post('/classification/form', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) {
            res.status(401).send();
            return;
        }
        classificationNode_system.eltClassification(req.body, classificationShared.actions.create, mongo_form, function (err) {
            if (!err) {
                res.send({code: 200, msg: "Classification Added"});
                mongo_data_system.addToClassifAudit({
                    date: new Date(),
                    user: {
                        username: req.user.username
                    },
                    elements: [{
                        _id: req.body.cdeId
                    }],
                    action: "add",
                    path: [req.body.orgName].concat(req.body.categories)
                });
            } else {
                res.send({code: 403, msg: "Classification Already Exists"});
            }

        });
    });

    app.delete('/classification/form', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.query.orgName)) {
            res.status(401).send();
            return;
        }
        classificationNode_system.eltClassification(req.query, classificationShared.actions.delete, mongo_form, function (err) {
            if (!err) {
                res.end();
                mongo_data_system.addToClassifAudit({
                    date: new Date(),
                    user: {
                        username: req.user.username
                    },
                    elements: [{
                        _id: req.query.cdeId
                    }],
                    action: "delete",
                    path: [req.query.orgName].concat(req.query.categories)
                });
            } else {
                res.status(202).send({error: {message: "Classification does not exists."}});
            }
        });
    });
};