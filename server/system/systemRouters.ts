import { disableRule, enableRule, getClassificationAuditLog, IdSource, updateOrg } from 'server/system/mongo-data';
import { handleError, respondError } from 'server/errorHandler/errorHandler';
import { isOrgAuthorityMiddleware, isOrgCuratorMiddleware, isSiteAdminMiddleware } from 'server/system/authorization';
import { draftsList as deDraftsList } from 'server/cde/mongo-cde';
import { draftsList as formDraftsList } from 'server/form/mongo-form';
import { getTrafficFilter } from 'server/system/traffic';
import { myOrgs } from 'server/system/usersrvc';

require('express-async-errors');

export function module() {
    const router = require('express').Router();

    router.post('/getClassificationAuditLog', isOrgAuthorityMiddleware, (req, res) => {
        getClassificationAuditLog(req.body, handleError({req, res}, result => res.send(result)));
    });

    router.post('/disableRule', isOrgAuthorityMiddleware, (req, res) => {
        disableRule(req.body, handleError({req, res}, org => {
            res.send(org);
        }));
    });

    router.post('/enableRule', isOrgAuthorityMiddleware, (req, res) => {
        enableRule(req.body, handleError({req, res}, org => {
            res.send(org);
        }));
    });

    router.get('/activeBans', isSiteAdminMiddleware, (req, res) => {
        getTrafficFilter(list => res.send(list));
    });

    router.post('/removeBan', isSiteAdminMiddleware, (req, res) => {
        getTrafficFilter(elt => {
            const foundIndex = elt.ipList.findIndex(r => r.ip === req.body.ip);
            if (foundIndex > -1) {
                elt.ipList.splice(foundIndex, 1);
                elt.save(() => res.send());
            } else {
                res.send();
            }
        });
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
