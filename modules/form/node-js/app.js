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
    , usersvc = require('../../cde/node-js/usersvc')
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
        var query = sharedElastic.buildElasticSearchQuery(req.user, req.body);
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
        var query = sharedElastic.buildElasticSearchQuery(req.user, req.body);
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

    var xmlbuilder=  require('xmlbuilder')
        , js2xml = require('js2xmlparser');
    app.get('/export/odm/form/:tinyId', function(req, res){
        function cdeToOdmDatatype(cdeType){
            var cdeOdmMapping = {
                "Value List": "text",
                "Character": "text",
                "Numeric": "float",
                "Date/Time": "datetime",
                "Number": "float",
                "Text": "text",
                "Date": "date",
                "Externally Defined": "text",
                "String\nNumeric": "text",
                "anyClass": "text",
                "java.util.Date": "date",
                "java.lang.String": "text",
                "java.lang.Long": "float",
                "java.lang.Integer": "integer",
                "java.lang.Double": "float",
                "java.lang.Boolean": "boolean",
                "java.util.Map": "text",
                "java.lang.Float": "float",
                "Time": "time",
                "xsd:string": "text",
                "java.lang.Character": "text",
                "xsd:boolean": "boolean",
                "java.lang.Short": "integer",
                "java.sql.Timestamp": "time",
                "DATE/TIME": "datetime",
                "java.lang.Byte": "integer"
            };
            return cdeOdmMapping[cdeType] || 'text';
        }

        mongo_data.eltByTinyId(req.params.tinyId, function(err, form){
            for (var i = 0; i < form.formElements.length; i++){
                var sec = form.formElements[i];
                for (var j = 0; j < sec.formElements.length; j++) {
                    if (sec.formElements[j].elementType === 'section') return res.status(202).send("Form with nested sections cannot be exported to ODM.");
                }
            }

            var odmJsonForm = {
                ODM: {
                    '@CreationDateTime': new Date().toISOString()
                    , '@FileOID': form.tinyId
                    , '@FileType': 'Snapshot'
                    , '@xmlns': 'http://www.cdisc.org/ns/odm/v1.3'
                    , '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
                    , '@xsi:noNamespaceSchemaLocation': 'ODM1-3-2.xsd'
                    , Study: {
                        '@OID': form.tinyId
                        , GlobalVariables: {
                            StudyName: form.naming[0].designation
                            , StudyDescription: form.naming[0].definition
                            , ProtocolName: form.naming[0].designation
                        }
                        , MetaDataVersion: [{
                            '@Name': form.naming[0].designation
                            , '@OID': form.tinyId
                            , FormDef: {
                                '@Name': form.naming[0].designation
                                , '@OID': form.tinyId
                                , '@Repeating': 'No'
                            }
                        }]
                    }
                }
            };
            var sections = [];
            var questions = [];
            form.formElements.forEach(function(s1){
                var childrenOids = [];
                s1.formElements.forEach(function(q1){
                    var oid = q1.question.cde.tinyId + Math.floor(Math.random()*1000);
                    childrenOids.push(oid);
                    questions.push({
                        ItemDef: {
                            Question: {
                                TranslatedText: q1.label
                            }
                            , '@DataType': cdeToOdmDatatype(q1.question.datatype)
                            , '@Name': q1.label
                            , '@OID': oid
                        }
                    });
                });
                sections.push({
                    ItemGroupDef: {
                        '@Name': s1.label
                        , '@OID': Math.floor(Math.random() * 1000)
                        , '@Repeating': 'No'
                        , ItemRef: childrenOids.map(function (oid, i) {
                            return {
                                '@ItemOID': oid
                                , '@Mandatory': 'Yes'
                                , '@OrderNumber': i
                            };
                        })
                    }
                });
            });
            sections.forEach(function(s){odmJsonForm.ODM.Study.MetaDataVersion.push(s)});
            questions.forEach(function(s){odmJsonForm.ODM.Study.MetaDataVersion.push(s)});
            var xmlForm = xmlbuilder.create(odmJsonForm).end({pretty:true});
            res.set('Content-Type', 'text/xml');
            res.send(xmlForm);
        });
    });

};