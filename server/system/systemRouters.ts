import { IdSource } from 'server/system/mongo-data';
import { respondError } from 'server/errorHandler/errorHandler';
import { isOrgAuthorityMiddleware, isOrgCuratorMiddleware, isSiteAdminMiddleware } from 'server/system/authorization';
import { draftsList as deDraftsList } from 'server/cde/mongo-cde';
import { draftsList as formDraftsList } from 'server/form/mongo-form';
import { myOrgs } from 'server/system/usersrvc';
import { disableRule, enableRule } from 'server/system/systemSvc';
import { getTrafficFilter } from 'server/system/trafficFilterSvc';
import { getClassificationAuditLog } from 'server/system/classificationAuditSvc';

require('express-async-errors');

export function module() {
    const router = require('express').Router();

    router.post('/getClassificationAuditLog', isOrgAuthorityMiddleware, async (req, res) => {
        const records = await getClassificationAuditLog(req.body);
        res.send(records);
    });

    router.post('/disableRule', isOrgAuthorityMiddleware, async (req, res) => {
        const savedOrg = await disableRule(req.body.orgName, req.body.rule.id);
        res.send(savedOrg);
    });

    router.post('/enableRule', isOrgAuthorityMiddleware, async (req, res) => {
        const savedOrg = await enableRule(req.body.orgName, req.body.rule);
        res.send(savedOrg);
    });

    router.get('/activeBans', isSiteAdminMiddleware, async (req, res) => {
        const list = await getTrafficFilter();
        res.send(list);
    });

    router.post('/removeBan', isSiteAdminMiddleware, async (req, res) => {
        const elt = await getTrafficFilter();
        const foundIndex = elt.ipList.findIndex(r => r.ip === req.body.ip);
        if (foundIndex > -1) {
            elt.ipList.splice(foundIndex, 1);
            await elt.save();
        }
        res.send();
    });

    // drafts
    router.get('/allDrafts', isOrgAuthorityMiddleware, (req, res) => {
        getDrafts(req, res, {});
    });

    router.get('/orgDrafts', isOrgCuratorMiddleware, (req, res) => {
        getDrafts(req, res, {'stewardOrg.name': {$in: myOrgs(req.user)}});
    });

    router.get('/myDrafts', isOrgCuratorMiddleware, (req, res) => {
        getDrafts(req, res, {'updatedBy.username': req.user.username});
    });

    function getDrafts(req, res, criteria) {
        Promise.all([deDraftsList(criteria), formDraftsList(criteria)])
            .then(results => res.send({draftCdes: results[0], draftForms: results[1]}))
            .catch(err => respondError(err, {req, res}));
    }

    // id sources
    router.get('/idSources', async (req, res) => {
        const sources = await IdSource.find({});
        res.send(sources);
    });

    router.get('/idSource/:id', async (req, res) => {
        const source = await IdSource.findOneById(req.params.id);
        res.send(source);
    });

    router.post('/idSource/:id', isSiteAdminMiddleware, async (req, res) => {
        const doc = await IdSource.findById(req.params.id);
        if (doc) {
            return res.status(409).send(req.params.id + ' already exists.');
        } else {
            const idSource = {
                _id: req.params.id,
                linkTemplateDe: req.body.linkTemplateDe,
                linkTemplateForm: req.body.linkTemplateForm,
                version: req.body.version,
            };
            const source = await new IdSource(idSource).save();
            res.send(source);
        }
    });

    router.put('/idSource/:id', isSiteAdminMiddleware, async (req, res) => {
        const doc = await IdSource.findById(req.body._id);
        if (!doc) {
            return res.status(404).send(req.params.id + ' does not exist.');
        } else {
            doc.linkTemplateDe = req.body.linkTemplateDe;
            doc.linkTemplateForm = req.body.linkTemplateForm;
            doc.version = req.body.version;
            const source = await doc.save();
            res.send(source);
        }
    });

    router.delete('/idSource/:id', isSiteAdminMiddleware, async (req, res) => {
        await IdSource.delete(req.params.id);
        res.send();
    });

    return router;
}
