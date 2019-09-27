import { isOrgAdminMiddleware, isOrgAuthorityMiddleware, nocacheMiddleware } from 'server/system/authorization';
import {
    addOrgAdmin, addOrgCurator, orgAdmins, orgCurators, removeOrgAdmin, removeOrgCurator
} from 'server/system/usersrvc';
import { addOrg, managedOrgs, transferSteward } from 'server/orgManagement/orgsvc';

require('express-validator');

export function module() {
    const router = require('express').Router();

    router.get('/myOrgsAdmins', nocacheMiddleware, async (req, res) => {

    });

    router.get('/orgAdmins', [nocacheMiddleware, isOrgAuthorityMiddleware], orgAdmins);
    router.post('/addOrgAdmin', isOrgAdminMiddleware, addOrgAdmin);
    router.post('/removeOrgAdmin', isOrgAdminMiddleware, removeOrgAdmin);

    router.get('/orgCurators', [nocacheMiddleware, isOrgAdminMiddleware], orgCurators);
    router.post('/addOrgCurator', isOrgAdminMiddleware, addOrgCurator);
    router.post('/removeOrgCurator', isOrgAdminMiddleware, removeOrgCurator);


    router.get('/org/:name', nocacheMiddleware, (req, res) => {
        return orgByName(req.params.name, (err, result) => res.send(result));
    });
    router.post('/transferSteward', transferSteward);

    router.get('/managedOrgs', managedOrgs);
    router.post('/addOrg', isOrgAuthorityMiddleware, addOrg);
    router.post('/updateOrg', isOrgAuthorityMiddleware, (req, res) => updateOrg(req.body, res));

    return router;
}
