var express = require('express')
    , path = require('path')
    , formCtrl = require('./formCtrl')
    , sharedElastic = require('../../system/node-js/elastic.js')
    , mongo_data = require('./mongo-form')
    , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
    , config = require('config')
    , multer  = require('multer')
    , sdc = require('./sdcForm')
    , logging = require('../../system/node-js/logging')
    , elastic_system = require('../../system/node-js/elastic')
;

exports.init = function(app, daoManager) {
    daoManager.registerDao(mongo_data);

    app.post('/findForms', formCtrl.findForms);
    
    app.post('/form', formCtrl.save);
    app.get('/form/:id', formCtrl.formById);

    if (config.modules.forms.attachments) {
        app.post('/attachments/form/setDefault', function(req, res) {
            adminItemSvc.setAttachmentDefault(req, res, mongo_data);
        });

        app.post('/attachments/form/add', multer(), function(req, res) {
            adminItemSvc.addAttachment(req, res, mongo_data);
        });

        app.post('/attachments/form/remove', function(req, res) {
            adminItemSvc.removeAttachment(req, res, mongo_data);
        });
    }
    
    app.get('/formById/:id/:type', formCtrl.formById);

    app.get('/formbytinyid/:id/:version', function(req, res) {
        res.send("");
    });

    app.get("/sdcExport/:id", function(req, res) {
        mongo_data.byId(req.params.id, function(err, form) {
            if (err) {
                logging.errorLogger.error("Error: Cannot find element by tiny id.", {origin: "system.adminItemSvc.approveComment", stack: new Error().stack}, req);
                return res.status(500).send();
            } else {
                res.setHeader("Content-Type", "application/xml");
                res.send(sdc.formToSDC(form));
            }
        });
    });

    app.get('/sdcExportByTinyId/:tinyId/:version', function(req, res) {
        mongo_data.byTinyIdAndVersion(req.params.tinyId, req.params.version, function(err, form) {
            if (err) {
                logging.errorLogger.error("Error: Cannot find element by tiny id.", {origin: "system.adminItemSvc.approveComment", stack: new Error().stack}, req);
                return res.status(500).send();
            } else {
                res.setHeader("Content-Type", "application/xml");
                res.send(sdc.formToSDC(form));
            }
        });
    });
    
    //app.post('/elasticSearch/form', function(req, res) {
    //   sharedElastic.elasticsearch(req.body.query, 'form', function(err, result) {
    //       if (err) return res.status(400).end();
    //       res.send(result);
    //   });
    //});

    app.post('/elasticSearch/form', function(req, res) {
        var query = elastic_system.buildElasticSearchQuery(req.body);
        sharedElastic.elasticsearch(query, 'form', function(err, result) {
            if (err) return res.status(400).end();
            res.send(result);
        });
    });

    //app.post('/elasticSearch/cde', function(req, res) {
    //    return elastic.elasticsearch(req.body, function(err, result) {
    //        if (err) return res.status(400).send("invalid query");
    //        result.cdes = cdesvc.hideProprietaryPvs(result.cdes, req.user);
    //        res.send(result);
    //    });
    //});

    if (config.modules.forms.comments) {
        app.post('/comments/form/add', function(req, res) {
            adminItemSvc.addComment(req, res, mongo_data);
        });

        app.post('/comments/form/remove', function(req, res) {
            adminItemSvc.removeComment(req, res, mongo_data);
        });

        app.post('/comments/form/approve', function(req, res) {
            adminItemSvc.declineApproveComment(req, res, mongo_data, function(elt) {
                elt.comments[req.body.comment.index].pendingApproval = false;
                delete elt.comments[req.body.comment.index].pendingApproval;
            }, "Comment approved!");
        });

        app.post('/comments/form/decline', function(req, res) {
            adminItemSvc.declineApproveComment(req, res, mongo_data, function(elt) {
                elt.comments.splice(req.body.comment.index, 1);
            }, "Comment declined!");
        });

    }

    app.get('/form/properties/keys', function(req, res) {
        adminItemSvc.allPropertiesKeys(req, res, mongo_data);
    });

    app.post('/elasticSearchExport/form', function(req, res) {
        var projectForm = function(elasticCde){
            var cde = {
                name: elasticCde.naming[0].designation
                , ids: elasticCde.ids.map(function(id) {return id.source + ": " + id.id + (id.version ? " v" + id.version : "")})
                , stewardOrg: elasticCde.stewardOrg.name
                , registrationStatus: elasticCde.registrationState.registrationStatus
                , adminStatus: elasticCde.registrationState.administrativeStatus
            };
            if (elasticCde.classification) cde.usedBy = elasticCde.classification.map(function(c){return c.stewardOrg.name});
            return cde;
        };
        var formHeader = "Name, Identifiers, Steward, Registration Status, Administrative Status, Used By\n";
        return elastic_system.elasticSearchExport(res, req.body.query, 'form', projectForm, formHeader);
    });

};