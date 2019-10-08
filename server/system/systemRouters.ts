import { respondError } from 'server/errorHandler/errorHandler';
import { isOrgAuthorityMiddleware, isOrgCuratorMiddleware, isSiteAdminMiddleware } from 'server/system/authorization';
import { draftsList as deDraftsList } from 'server/cde/mongo-cde';
import { draftsList as formDraftsList } from 'server/form/mongo-form';
import { myOrgs } from 'server/system/usersrvc';
import { disableRule, enableRule } from 'server/system/systemSvc';
import { getTrafficFilter } from 'server/system/trafficFilterSvc';
import { getClassificationAuditLog } from 'server/system/classificationAuditSvc';
import { orgByName } from 'server/orgManagement/orgDb';
import { Router } from 'express';
import {
    createIdSource, deleteIdSource, getAllIdSources, isSourceById, updateIdSource
} from 'server/system/idSourceSvc';

require('express-async-errors');

export function module() {
    const router = Router();

    router.post('/getClassificationAuditLog', isOrgAuthorityMiddleware, async (req, res) => {
        const records = await getClassificationAuditLog(req.body);
        res.send(records);
    });

    router.post('/disableRule', isOrgAuthorityMiddleware, async (req, res) => {
        const org = await orgByName(req.body.orgName);
        await disableRule(org, req.body.rule.id);
        const savedOrg = await org.save();
        res.send(savedOrg);
    });

    router.post('/enableRule', isOrgAuthorityMiddleware, async (req, res) => {
        const org = await orgByName(req.body.orgName);
        await enableRule(org, req.body.rule);
        const savedOrg = await org.save();
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
        const sources = await getAllIdSources();
        res.send(sources);
    });

    router.get('/idSource/:id', async (req, res) => {
        const source = await isSourceById(req.params.id);
        res.send(source);
    });

    router.post('/idSource/:id', isSiteAdminMiddleware, async (req, res) => {
        const sourceId = req.params.id;
        const foundSource = await isSourceById(sourceId);
        if (foundSource) {
            return res.status(409).send(sourceId + ' already exists.');
        } else {
            const createdIdSource = await createIdSource(sourceId, req.body);
            res.send(createdIdSource);
        }
    });

    router.put('/idSource/:id', isSiteAdminMiddleware, async (req, res) => {
        const sourceId = req.params.id;
        const foundSource = await isSourceById(sourceId);
        if (!foundSource) {
            return res.status(409).send(sourceId + ' does not exist.');
        } else {
            const updatedIdSource = await updateIdSource(sourceId, req.body);
            res.send(updatedIdSource);
        }
    });

    router.delete('/idSource/:id', isSiteAdminMiddleware, async (req, res) => {
        await deleteIdSource(req.params.id);
        res.send();
    });
    return router;
}
