import { isOrgAdminMiddleware, isOrgAuthorityMiddleware, nocacheMiddleware } from 'server/system/authorization';
import {
    addOrg, addOrgAdmin, addOrgCurator, myOrgsAdmins, orgAdmins, orgCurators, removeOrgAdmin, removeOrgCurator
} from 'server/orgManagement/orgSvc';
import { managedOrgs, orgByName, updateOrg } from 'server/orgManagement/orgDb';

export function module() {
    const router = require('express').Router();

    router.get('/org/:name', nocacheMiddleware, (req, res) => {
        return orgByName(req.params.name, (err, result) => res.send(result));
    });

    router.get('/managedOrgs', (req, res) => {
        managedOrgs(orgs => res.send(orgs));
    });
    router.post('/addOrg', isOrgAuthorityMiddleware, addOrg);
    router.post('/updateOrg', isOrgAuthorityMiddleware, (req, res) => updateOrg(req.body, res));

    router.get('/myOrgsAdmins', nocacheMiddleware, myOrgsAdmins);

    router.get('/orgAdmins', [nocacheMiddleware, isOrgAuthorityMiddleware], orgAdmins);
    router.post('/addOrgAdmin', isOrgAdminMiddleware, addOrgAdmin);
    router.post('/removeOrgAdmin', isOrgAdminMiddleware, removeOrgAdmin);

    router.get('/orgCurators', nocacheMiddleware, isOrgAdminMiddleware, orgCurators);
    router.post('/addOrgCurator', isOrgAdminMiddleware, addOrgCurator);
    router.post('/removeOrgCurator', isOrgAdminMiddleware, removeOrgCurator);

    return router;
}
