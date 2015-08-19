var express = require('express')
    , path = require('path')
    , formCtrl = require('./formCtrl')
    , mongo_data = require('./mongo-form')
    , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
    , config = require('../../system/node-js/parseConfig')
    , multer = require('multer')
    , sdc = require('./sdcForm')
    , logging = require('../../system/node-js/logging')
    , elastic_system = require('../../system/node-js/elastic')
    , sharedElastic = require('../../system/node-js/elastic.js')
    , exportShared = require('../../system/shared/exportShared')
    ;

exports.init = function (app, daoManager) {
    daoManager.registerDao(mongo_data);

    app.post('/findForms', formCtrl.findForms);

    app.post('/form', formCtrl.save);
    app.get('/form/:id', exportShared.nocacheMiddleware, formCtrl.formById);

    if (config.modules.forms.attachments) {
        app.post('/attachments/form/setDefault', function (req, res) {
            adminItemSvc.setAttachmentDefault(req, res, mongo_data);
        });

        app.post('/attachments/form/add', multer(config.multer), function (req, res) {
            adminItemSvc.addAttachment(req, res, mongo_data);
        });

        app.post('/attachments/form/remove', function (req, res) {
            adminItemSvc.removeAttachment(req, res, mongo_data);
        });
    }

    app.get('/formById/:id/:type', exportShared.nocacheMiddleware, formCtrl.formById);

    app.get('/formbytinyid/:id/:version', exportShared.nocacheMiddleware, function (req, res) {
        res.send("");
    });

    app.get("/sdcExport/:id", exportShared.nocacheMiddleware, function (req, res) {
        mongo_data.byId(req.params.id, function (err, form) {
            if (err) {
                logging.errorLogger.error("Error: Cannot find element by tiny id.", {
                    origin: "system.adminItemSvc.approveComment",
                    stack: new Error().stack
                }, req);
                return res.status(500).send();
            } else {
                res.setHeader("Content-Type", "application/xml");
                res.send(sdc.formToSDC(form));
            }
        });
    });

    app.get('/sdcExportByTinyId/:tinyId/:version', exportShared.nocacheMiddleware, function (req, res) {
        mongo_data.byTinyIdAndVersion(req.params.tinyId, req.params.version, function (err, form) {
            if (err) {
                logging.errorLogger.error("Error: Cannot find element by tiny id.", {
                    origin: "system.adminItemSvc.approveComment",
                    stack: new Error().stack
                }, req);
                return res.status(500).send();
            } else {
                res.setHeader("Content-Type", "application/xml");
                res.send(sdc.formToSDC(form));
            }
        });
    });

    app.post('/elasticSearch/form', function (req, res) {
        var query = sharedElastic.buildElasticSearchQuery(req.body);
        sharedElastic.elasticsearch(query, 'form', function (err, result) {
            if (err) return res.status(400).send("invalid query");
            res.send(result);
        });
    });

    if (config.modules.forms.comments) {
        app.post('/comments/form/add', function (req, res) {
            adminItemSvc.addComment(req, res, mongo_data);
        });

        app.post('/comments/form/remove', function (req, res) {
            adminItemSvc.removeComment(req, res, mongo_data);
        });

        app.post('/comments/form/approve', function (req, res) {
            adminItemSvc.declineApproveComment(req, res, mongo_data, function (elt) {
                elt.comments[req.body.comment.index].pendingApproval = false;
                delete elt.comments[req.body.comment.index].pendingApproval;
            }, "Comment approved!");
        });

        app.post('/comments/form/decline', function (req, res) {
            adminItemSvc.declineApproveComment(req, res, mongo_data, function (elt) {
                elt.comments.splice(req.body.comment.index, 1);
            }, "Comment declined!");
        });

    }

    app.get('/form/properties/keys', exportShared.nocacheMiddleware, function (req, res) {
        adminItemSvc.allPropertiesKeys(req, res, mongo_data);
    });

    app.post('/elasticSearchExport/form', function (req, res) {
        var formHeader = "Name, Identifiers, Steward, Registration Status, Administrative Status, Used By\n";
        var query = sharedElastic.buildElasticSearchQuery(req.body);
        return elastic_system.elasticSearchExport(res, query, 'form', exportShared.projectFormForExport, formHeader);
    });

    app.get('/formCompletion/:term', exportShared.nocacheMiddleware, function (req, res) {
        return [];
    });

    app.post('/pinFormCdes', function(req, res) {
        if (req.isAuthenticated()) {
            mongo_data.eltByTinyId(req.body.formTinyId, function (err, form) {
                if (form) {
                    var allCdes = {};
                    var allTinyIds = [];
                    formCtrl.findAllCdesInForm(form, allCdes, allTinyIds);
                    var fakeCdes = allTinyIds.map(function(_tinyId) {
                        return {tinyId: _tinyId};
                    });
                    usersvc.pinAllToBoard(req, fakeCdes, res)
                } else {
                    res.status(404).end();
                }
            });
        } else {
            res.send("Please login first.");
        }
    });

};