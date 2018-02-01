const _ = require('lodash');
const express = require('express');
const path = require('path');
const dns = require('dns');
const os = require('os');
const multer = require('multer');
const config = require('../system/parseConfig');
const formCtrl = require('./formCtrl');
const formSvc = require("./formsvc");
const mongo_form = require('./mongo-form');
const mongo_data_system = require('../system/mongo-data');
const classificationNode_system = require('../system/classificationNode');
const adminItemSvc = require('../system/adminItemSvc.js');
const elastic_system = require('../system/elastic');
// const elastic = require('./elastic');
const sharedElastic = require('../system/elastic.js');
const exportShared = require('@std/esm')(module)('../../shared/system/exportShared');
const boardsvc = require('../board/boardsvc');
const usersrvc = require('../system/usersrvc');

// ucum from lhc uses IndexDB
global.location = {origin: 'localhost'};
const setGlobalVars = require('indexeddbshim');
global.window = global; // We'll allow ourselves to use `window.indexedDB` or `indexedDB` as a global
setGlobalVars();
const ucum = require('ucum').UcumLhcUtils.getInstance();

function allowXOrigin(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
}

exports.init = function (app, daoManager) {
    daoManager.registerDao(mongo_form);

    app.get("/formById/:id", exportShared.nocacheMiddleware, formSvc.byId);
    app.get("/formById/:id/priorForms/", exportShared.nocacheMiddleware, formSvc.priorForms);

    app.get("/form/:tinyId", [allowXOrigin, exportShared.nocacheMiddleware], formSvc.byTinyId);
    app.get("/form/:tinyId/version/:version?", [allowXOrigin, exportShared.nocacheMiddleware], formSvc.byTinyIdVersion);
    app.get("/formList/:tinyIdList?", exportShared.nocacheMiddleware, formSvc.byTinyIdList);

    app.get("/draftForm/:tinyId", formSvc.draftForms);
    app.post("/draftForm/:tinyId", formSvc.saveDraftForm);
    app.delete("/draftForm/:tinyId", formSvc.deleteDraftForm);

    app.get("/form/:tinyId/latestVersion/", exportShared.nocacheMiddleware, formSvc.latestVersionByTinyId);

    app.post("/form/:id?", formSvc.createForm);
    app.put("/form/:tinyId", formSvc.updateForm);

    app.post('/form/publish/:id', formSvc.publishForm);

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
    app.get('/elasticSearch/form/count', function (req, res) {
        return elastic_system.nbOfForms(function (err, result) {
            res.send("" + result);
        });
    });

    app.post('/attachments/form/setDefault', function (req, res) {
        adminItemSvc.setAttachmentDefault(req, res, mongo_form);
    });

    app.post('/attachments/form/add', multer(config.multer), function (req, res) {
        adminItemSvc.addAttachment(req, res, mongo_form);
    });

    app.post('/attachments/form/remove', function (req, res) {
        adminItemSvc.removeAttachment(req, res, mongo_form);
    });

    app.post('/elasticSearch/form', function (req, res) {
        const query = sharedElastic.buildElasticSearchQuery(req.user, req.body);
        if (query.size > 100) return res.status(400).send();
        if ((query.from + query.size) > 10000) return res.status(400).send();
        if (!req.body.fullRecord) {
            query._source = {excludes: ["flatProperties", "properties", "classification.elements", "formElements"]};
        }
        sharedElastic.elasticsearch('form', query, req.body, function (err, result) {
            if (err) return res.status(400).send("invalid query");
            res.send(result);
        });
    });

    app.post('/comments/form/add', function (req, res) {
        adminItemSvc.addComment(req, res, mongo_form);
    });
    app.post('/comments/form/remove', function (req, res) {
        adminItemSvc.removeComment(req, res, mongo_form);
    });

    app.post('/elasticSearchExport/form', function (req, res) {
        let query = sharedElastic.buildElasticSearchQuery(req.user, req.body);
        let exporters = {
            json: {
                export: function (res) {
                    let firstElt = true;
                    res.type('application/json');
                    res.write("[");
                    elastic_system.elasticSearchExport(function dataCb(err, elt) {
                        if (err) return res.status(500).send("ERROR - cannot search export");
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

    app.post('/formCompletion/:term', exportShared.nocacheMiddleware, (req, res) => {
        let term = req.params.term;
        elastic_system.completionSuggest(term, req.user, req.body, config.elastic.formIndex.name, resp => {
            resp.hits.hits.forEach(r => r._index = undefined);
            res.send(resp.hits.hits);
        });
    });

    app.post('/pinFormCdes', function (req, res) {
        if (req.isAuthenticated()) {
            mongo_form.eltByTinyId(req.body.formTinyId, function (err, form) {
                if (form) {
                    let allCdes = {};
                    let allTinyIds = [];
                    formCtrl.findAllCdesInForm(form, allCdes, allTinyIds);
                    let fakeCdes = allTinyIds.map(function (_tinyId) {
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
            if (err) return res.status(500).send("ERROR - cannot add form classif");
            if (result === "Classification Already Exists") return res.status(409).send(result); else res.send(result);
            mongo_data_system.addToClassifAudit({
                date: new Date(), user: {
                    username: req.user.username
                }, elements: [{
                    _id: req.body.eltId
                }], action: "add", path: [req.body.orgName].concat(req.body.categories)
            });

        });
    });

    app.post("/removeFormClassification/", function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) return res.status(401).send({error: "You do not permission to do this."});
        let invalidateRequest = classificationNode_system.isInvalidatedClassificationRequest(req);
        if (invalidateRequest) return res.status(400).send({error: invalidateRequest});
        classificationNode_system.removeClassification(req.body, mongo_form, function (err, elt) {
            if (err) return res.status(500).send({error: err}); else res.send(elt);
            mongo_data_system.addToClassifAudit({
                date: new Date(), user: {
                    username: req.user.username
                }, elements: [{
                    _id: req.body.eltId
                }], action: "delete", path: [req.body.orgName].concat(req.body.categories)
            });
        });
    });

    // This is for tests only
    app.post('/sendMockFormData', function (req, res) {
        let mapping = JSON.parse(req.body.mapping);
        if (req.body.q1 === "1" && req.body.q2 === "2"
            && req.body.q3 === "Lab Name"
            && mapping.sections[0].questions[0].question === "Number of CAG repeats on a larger allele"
            && mapping.sections[0].questions[0].name === "q1"
            && mapping.sections[0].questions[0].ids[0].source === "NINDS"
            && mapping.sections[0].questions[0].ids[0].id === "C14936"
            && mapping.sections[0].questions[0].ids[0].version === "3"
            && mapping.sections[0].questions[0].ids[1].source === "NINDS Variable Name"
            && mapping.sections[0].questions[0].ids[1].id === "CAGRepeatsLargerAlleleNum"
            && mapping.sections[0].questions[0].tinyId === "VTO0Feb6NSC"
            && mapping.sections[0].questions[1].tinyId === "uw_koHkZ_JT"
            && mapping.sections[0].questions[2].question === "Name of laboratory that performed this molecular study"
            && mapping.sections[0].questions[2].name === "q3"
            && mapping.sections[0].questions[2].tinyId === "EdUB2kWmV61") {
            if (req.body.formUrl.indexOf(config.publicUrl + "/data") === 0) res.send("<html><body>Form Submitted</body></html>"); else if (config.publicUrl.indexOf('localhost') === -1) {
                dns.lookup(/\/\/.*:/.exec(req.body.formUrl), (err, result) => {
                    if (!err && req.body.formUrl.indexOf(result + "/data") === 0) res.send("<html><body>Form Submitted</body></html>"); else res.status(401).send("<html><body>Not the right input</body></html>");
                });
            } else {
                let ifaces = os.networkInterfaces();
                if (Object.keys(ifaces).some(ifname => {
                        return ifaces[ifname].filter(iface => {
                            return req.body.formUrl.indexOf(iface.address + "/data") !== 1;
                        }).length > 0;
                    })) res.send("<html><body>Form Submitted</body></html>"); else res.status(401).send("<html><body>Not the right input</body></html>");
            }
        } else {
            res.status(401).send("<html><body>Not the right input</body></html>");
        }
    });

    app.get('/schema/form', (req, res) => res.send(mongo_form.Form.jsonSchema()));

    app.get('/ucumConvert', (req, res) => {
        let value = req.query.value === '0' ? 1e-20 : parseFloat(req.query.value); // 0 workaround
        let result = ucum.convertUnitTo(req.query.from, value, req.query.to);
        if (result.status === 'succeeded') {
            let ret = Math.abs(result.toVal) < 1 ? _.round(result.toVal, 10) : result.toVal; // 0 workaround
            res.send('' + ret);
        } else {
            res.send('');
        }
    });

    // cb(error, uom)
    function validateUom(uom, cb) {
        let error;
        let validation = ucum.validateUnitString(uom, true);
        if (validation.status === 'valid')
            return cb(undefined, uom);

        if (validation.suggestions && validation.suggestions.length) {
            let suggestions = [];
            validation.suggestions.forEach(s => s.units.forEach(u => u.name === uom ? suggestions.push(u.code) : null));
            if (suggestions.length)
                return cb(undefined, suggestions[0]);

            if (validation.suggestions[0].units.length) {
                let suggestion = validation.suggestions[0].units[0];
                error = 'Unit is not found. Did you mean ' + suggestion[0] + ' (' + suggestion[1] + ')?';
            }
        } else {
            let suggestions = [];
            let synonyms = ucum.checkSynonyms(uom);
            if (synonyms.status === 'succeeded' && synonyms.units.length) {
                synonyms.units.forEach(u => u.name === uom ? suggestions.push(u.code) : null);
                if (suggestions.length)
                    return cb(undefined, suggestions[0]);

                error = 'Unit is not found. Did you mean ' + synonyms.units[0].name + '?';
            }
        }
        if (!error)
            error = validation.msg.length ? 'Unit is not found. ' + validation.msg[0] : 'Unit is not found.';
        cb(error, uom);
    }

    app.get('/ucumSynonyms', (req, res) => {
        let uom = req.query.uom;
        if (!uom || typeof uom !== 'string')
            return res.sendStatus(400);

        let resp = ucum.getSpecifiedUnit(uom, 'validate', 'false');
        if (!resp || !resp.unit)
            return res.send([]);

        let unit = resp.unit;
        let name = unit.name_;
        let synonyms = unit.synonyms_.split('; ');
        if (synonyms.length && synonyms[synonyms.length - 1] === '')
            synonyms.length--;
        res.send([name, ...synonyms]);
    });

    app.get('/ucumNames', (req, res) => {
        let uom = req.query.uom;
        if (!uom || typeof uom !== 'string')
            return res.sendStatus(400);

        let resp = ucum.getSpecifiedUnit(uom, 'validate', true);
        if (!resp || !resp.unit)
            return res.send([]);
        else res.send([{
            name: resp.unit.name_,
            synonyms: resp.unit.synonyms_.split('; '),
            code: resp.unit.csCode_
        }]);
    });

    app.get('/ucumValidate', (req, res) => {
        let uoms = JSON.parse(req.query.uoms);
        if (!Array.isArray(uoms))
            return res.sendStatus(400);

        let errors = [];
        let units = [];
        uoms.forEach((uom, i) => {
            validateUom(uom, (error, u) => {
                errors[i] = error;
                units[i] = u;
                if (!errors[i] && uom !== units[i])
                    errors[i] = 'Unit ' + uom + ' found but needs to be replaced with ' + units[i];
            });
            if (i > 0 && !errors[0] && !errors[i]) {
                let result = ucum.convertUnitTo(units[i], 1, units[0], true);
                if (result.status !== 'succeeded')
                    errors[i] = 'Unit not compatible with first unit.' + (result.msg.length ? ' ' + result.msg[0] : '');
            }
        });
        res.send({errors: errors, units: units});
    });
};
