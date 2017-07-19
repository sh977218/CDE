var express = require('express')
    , path = require('path')
    , formCtrl = require('./formCtrl')
    , formSvc = require("./formsvc")
    , mongo_form = require('./mongo-form')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , classificationNode_system = require('../../system/node-js/classificationNode')
    , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
    , config = require('../../system/node-js/parseConfig')
    , multer = require('multer')
    , sdc = require('./sdcForm')
    , logging = require('../../system/node-js/logging')
    , elastic_system = require('../../system/node-js/elastic')
    , sharedElastic = require('../../system/node-js/elastic.js')
    , exportShared = require('../../system/shared/exportShared')
    , boardsvc = require('../../board/node-js/boardsvc')
    , usersrvc = require('../../system/node-js/usersrvc')
    , dns = require('dns')
    , os = require('os')
;

exports.init = function (app, daoManager) {
    daoManager.registerDao(mongo_form);
    app.use("/form/shared", express.static(path.join(__dirname, '../shared')));

    app.get("/form/id/:id", exportShared.nocacheMiddleware, formSvc.byId);
    app.get("/form/id/:id/history/", exportShared.nocacheMiddleware, formSvc.priorForms);
    app.get("/form/id/:id/version/", exportShared.nocacheMiddleware, formSvc.versionById);

    app.get("/form/tinyId/:tinyId", exportShared.nocacheMiddleware, formSvc.byTinyId);
    app.get("/form/tinyId/:tinyId/version/:version", exportShared.nocacheMiddleware, formSvc.byTinyIdVersion);
    app.get("/form/tinyId/:tinyId/version/", exportShared.nocacheMiddleware, formSvc.versionByTinyId);

    /*
        app.post("/form/", exportShared.nocacheMiddleware, formCtrl.save);
    */
    app.put("/form/tinyId/:tinyId", exportShared.nocacheMiddleware, formSvc.updateForm);

    app.post('/form/publish', formCtrl.publishForm);

    app.get('/viewingHistory/form', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.user) {
            res.send("You must be logged in to do that");
        } else {
            let splicedArray = req.user.formViewHistory.splice(0, 10);
            let idList = [];
            for (let i = 0; i < splicedArray.length; i++) {
                if (idList.indexOf(splicedArray[i]) === -1) idList.push(splicedArray[i]);
            }
            mongo_form.byTinyIdListInOrder(idList, function (err, forms) {
                res.send(forms);
            });
        }
    });
    /* ---------- PUT NEW REST API above ---------- */

    app.get('/wholeForm/:id', exportShared.nocacheMiddleware, formCtrl.wholeFormById);

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
                sdc.formToSDC(form, null, function (txt) {
                    res.send(txt);
                });
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
                    boardsvc.pinAllToBoard(req, fakeCdes, res);
                } else {
                    res.status(404).end();
                }
            });
        } else {
            res.send("Please login first.");
        }
    });

    app.post('/addFormClassification/', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) return res.status(401).send("You do not permission to do this.");
        let invalidateRequest = classificationNode_system.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) return res.status(400).send(invalidateRequest);
        classificationNode_system.addClassification(req.body, mongo_form, function (err, result) {
            if (err) return res.status(500).send(err);
            if (result === "Classification Already Exists") return res.status(409).send(result);
            else res.send(result);
            mongo_data_system.addToClassifAudit({
                date: new Date(),
                user: {
                    username: req.user.username
                },
                elements: [{
                    _id: req.body.eltId
                }],
                action: "add",
                path: [req.body.orgName].concat(req.body.categories)
            });

        });
    });

    app.post("/removeFormClassification/", function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) return res.status(401).send({error: "You do not permission to do this."});
        let invalidateRequest = classificationNode_system.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) return res.status(400).send({error: invalidateRequest});
        classificationNode_system.removeClassification(req.body, mongo_form, function (err, elt) {
            if (err) return res.status(500).send({error: err});
            else res.send(elt);
            mongo_data_system.addToClassifAudit({
                date: new Date(),
                user: {
                    username: req.user.username
                },
                elements: [{
                    _id: req.body.eltId
                }],
                action: "delete",
                path: [req.body.orgName].concat(req.body.categories)
            });
        });
    });

    // This is for tests only
    app.post('/sendMockFormData', function (req, res) {
        if (
            req.body.q1 === "1" &&
            req.body.q2 === "2" &&
            req.body.q3 === "Lab Name" &&
            req.body.mapping === "{\"sections\":[{\"section\":\"\",\"questions\":[{\"question\":\"Number of CAG repeats on a larger allele\",\"name\":\"q1\",\"ids\":[{\"source\":\"NINDS\",\"id\":\"C14936\",\"version\":\"3\"},{\"source\":\"NINDS Variable Name\",\"id\":\"CAGRepeatsLargerAlleleNum\"}],\"tinyId\":\"VTO0Feb6NSC\"},{\"question\":\"Number of CAG repeats on a smaller allele\",\"name\":\"q2\",\"ids\":[{\"source\":\"NINDS\",\"id\":\"C14937\",\"version\":\"3\"},{\"source\":\"NINDS Variable Name\",\"id\":\"CAGRepeatsSmallerAlleleNum\"}],\"tinyId\":\"uw_koHkZ_JT\"},{\"question\":\"Name of laboratory that performed this molecular study\",\"name\":\"q3\",\"ids\":[{\"source\":\"NINDS\",\"id\":\"C17744\",\"version\":\"3\"},{\"source\":\"NINDS Variable Name\",\"id\":\"MolecularStdyLabName\"}],\"tinyId\":\"EdUB2kWmV61\"}]}]}"
        ) {
            if (req.body.formUrl.indexOf(config.publicUrl + "/data") === 0)
                res.send("<html><body>Form Submitted</body></html>");
            else if (config.publicUrl.indexOf('localhost') === -1) {
                dns.lookup(/\/\/.*:/.exec(req.body.formUrl), (err, result) => {
                    if (!err && req.body.formUrl.indexOf(result + "/data") === 0)
                        res.send("<html><body>Form Submitted</body></html>");
                    else
                        res.status(401).send("<html><body>Not the right input</body></html>");
                });
            } else {
                let ifaces = os.networkInterfaces();
                if (Object.keys(ifaces).some(ifname => {
                        return ifaces[ifname].filter(iface => {
                            return req.body.formUrl.indexOf(iface.address + "/data") !== 1;
                        }).length > 0;
                    }))
                    res.send("<html><body>Form Submitted</body></html>");
                else
                    res.status(401).send("<html><body>Not the right input</body></html>");
            }
        } else {
            res.status(401).send("<html><body>Not the right input</body></html>");
        }
    });

    app.get('/schema/form', (req, res) => res.send(mongo_form.Form.jsonSchema()));
};