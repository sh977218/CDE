const _ = require('lodash');
const dns = require('dns');
const os = require('os');
const authorization = require('../system/authorization');
const authorizationShared = require('esm')(module)('../../shared/system/authorizationShared');
const config = require('../system/parseConfig');
const formSvc = require('./formsvc');
const mongo_form = require('./mongo-form');
const elastic_system = require('../system/elastic');
const handleError = require('../log/dbLogger').handleError;
const sharedElastic = require('../system/elastic.js');
const exportShared = require('esm')(module)('../../shared/system/exportShared');

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

    app.get("/form/:tinyId", [allowXOrigin, exportShared.nocacheMiddleware], formSvc.byTinyId);
    app.get("/form/:tinyId/latestVersion/", exportShared.nocacheMiddleware, formSvc.latestVersionByTinyId);
    app.get("/form/:tinyId/version/:version?", [allowXOrigin, exportShared.nocacheMiddleware], formSvc.byTinyIdAndVersion);
    app.post("/form", authorization.canEditMiddleware, formSvc.createForm);
    app.put("/form/:tinyId", authorization.canEditMiddleware, formSvc.updateForm);
    app.put("/formPublish/:tinyId", authorization.canEditMiddleware, formSvc.publishTheForm);

    app.get("/formById/:id", exportShared.nocacheMiddleware, formSvc.byId);
    app.get("/formById/:id/priorForms/", exportShared.nocacheMiddleware, formSvc.priorForms);

    app.get("/formForEdit/:tinyId", exportShared.nocacheMiddleware, formSvc.forEditByTinyId);
    app.get("/formForEdit/:tinyId/version/:version?", exportShared.nocacheMiddleware, formSvc.forEditByTinyIdAndVersion);
    app.get("/formForEditById/:id", exportShared.nocacheMiddleware, formSvc.forEditById);

    app.get("/formList/:tinyIdList?", exportShared.nocacheMiddleware, formSvc.byTinyIdList);

    const canEditItemByIdMiddleware = [authorization.isOrgCuratorMiddleware, (req, res, next) => {
        mongo_form.byTinyId(req.params.tinyId, handleError({req, res}, form => {
            if (!authorizationShared.canEditCuratedItem(req.user, form)) {
                return res.status(403).send();
            }
            next();
        }));
    }];

    app.get("/draftForm/:tinyId", formSvc.draftForm);
    app.post("/draftForm/:tinyId", authorization.canEditMiddleware, formSvc.saveDraftForm);
    app.delete("/draftForm/:tinyId", canEditItemByIdMiddleware, formSvc.deleteDraftForm);

    app.get("/draftFormById/:id",formSvc.draftFormById);

    app.post('/form/publish/:id', authorization.loggedInMiddleware, formSvc.publishForm);

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
        elastic_system.nbOfForms((err, result) => res.send("" + result));
    });

    app.post('/elasticSearch/form', (req, res) => {
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

    app.post('/scrollExport/form', (req, res) => {
        let query = sharedElastic.buildElasticSearchQuery(req.user, req.body);
        elastic_system.scrollExport(query, "form", (err, response) => {
            if (err) res.status(400).send();
            else res.send(response);
        });
    });

    app.get('/scrollExport/:scrollId', (req, res) => {
        elastic_system.scrollNext(req.params.scrollId, (err, response) => {
            if (err) res.status(400).send();
            else res.send(response);
        });
    });

    app.post('/elasticSearchExport/form', (req, res) => {
        let query = sharedElastic.buildElasticSearchQuery(req.user, req.body);
        let exporters = {
            json: {
                export: function (res) {
                    let firstElt = true;
                    res.type('application/json');
                    res.write("[");
                    elastic_system.elasticSearchExport(handleError({req, res}, elt => {
                        if (elt) {
                            if (!firstElt) res.write(',');
                            elt = exportShared.stripBsonIds(elt);
                            elt = elastic_system.removeElasticFields(elt);
                            res.write(JSON.stringify(elt));
                            firstElt = false;
                        } else {
                            res.write("]");
                            res.send();
                        }
                    }), query, 'form');
                }
            }
        };
        exporters.json.export(res);
    });

    app.post('/formCompletion/:term', exportShared.nocacheMiddleware, (req, res) => {
        let term = req.params.term;
        elastic_system.completionSuggest(term, req.user, req.body, config.elastic.formSuggestIndex.name, resp => {
            resp.hits.hits.forEach(r => r._index = undefined);
            res.send(resp.hits.hits);
        });
    });

    // This is for tests only
    app.post('/sendMockFormData', function (req, res) {
        let mapping = JSON.parse(req.body.mapping);
        if (req.body["0-0"] === "1" && req.body["0-1"] === "2"
            && req.body["0-2"] === "Lab Name"
            && req.body["0-3"] === "FEMALE"
            && mapping.sections[0].questions[0].question === "Number of CAG repeats on a larger allele"
            && mapping.sections[0].questions[0].name === "0-0"
            && mapping.sections[0].questions[0].ids[0].source === "NINDS"
            && mapping.sections[0].questions[0].ids[0].id === "C14936"
            && mapping.sections[0].questions[0].ids[0].version === "3"
            && mapping.sections[0].questions[0].ids[1].source === "NINDS Variable Name"
            && mapping.sections[0].questions[0].ids[1].id === "CAGRepeatsLargerAlleleNum"
            && mapping.sections[0].questions[0].tinyId === "VTO0Feb6NSC"
            && mapping.sections[0].questions[1].tinyId === "uw_koHkZ_JT"
            && mapping.sections[0].questions[2].question === "Name of laboratory that performed this molecular study"
            && mapping.sections[0].questions[2].name === "0-2"
            && mapping.sections[0].questions[2].tinyId === "EdUB2kWmV61"
            && mapping.sections[0].questions[3].name === "0-3"
            && mapping.sections[0].questions[3].tinyId === "JWWpC2baVwK"
        ) {
            if (req.body.formUrl.indexOf(config.publicUrl + "/data") === 0) res.send('<html lang="en"><body>Form Submitted</body></html>'); else if (config.publicUrl.indexOf('localhost') === -1) {
                dns.lookup(/\/\/.*:/.exec(req.body.formUrl), (err, result) => {
                    if (!err && req.body.formUrl.indexOf(result + "/data") === 0) res.send('<html lang="en"><body>Form Submitted</body></html>"); else res.status(401).send("<html lang="en"><body>Not the right input</body></html>');
                });
            } else {
                let ifaces = os.networkInterfaces();
                if (Object.keys(ifaces).some(ifname => {
                        return ifaces[ifname].filter(iface => {
                            return req.body.formUrl.indexOf(iface.address + "/data") !== 1;
                        }).length > 0;
                    })) res.send('<html lang="en"><body>Form Submitted</body></html>');
                else {
                    res.status(401).send('<html lang="en"><body>Not the right input. Actual Input: <p>' + '</p></body></html>');
                }
            }
        } else {
            res.status(401).send('<html lang="en"><body>Not the right input</body></html>');
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
        if (!uom || typeof uom !== 'string') return res.sendStatus(400);

        let resp = ucum.getSpecifiedUnit(uom, 'validate', true);
        if (!resp || !resp.unit) return res.send([]);
        else {
            res.send([{
                name: resp.unit.name_,
                synonyms: resp.unit.synonyms_.split('; '),
                code: resp.unit.csCode_
            }]);
        }
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
