import { Router } from 'express';
import { isOrgAdminMiddleware, isOrgAuthorityMiddleware, nocacheMiddleware } from 'server/system/authorization';
import {
    addNewOrg, addOrgAdmin, addOrgCurator, myOrgsAdmins, orgAdmins, orgCurators, removeOrgAdmin, removeOrgCurator,
    transferSteward
} from 'server/orgManagement/orgSvc';
import { listOrgsDetailedInfo, managedOrgs, orgByName, updateOrg } from 'server/orgManagement/orgDb';

export function module() {
    const router = Router();

    router.get('/org/:name', nocacheMiddleware, (req, res) => {
        return orgByName(req.params.name, (err, result) => res.send(result));
    });

    router.get('/managedOrgs', async (req, res) => {
        const orgs = await managedOrgs();
        res.send(orgs);
    });
    router.post('/addOrg', isOrgAuthorityMiddleware, async (req, res) => {
        const newOrg = req.body;
        const foundOrg = await orgByName(newOrg.name);
        if (foundOrg) {
            res.status(409).send('Org Already Exists');
        } else {
            const savedOrg = await addNewOrg(newOrg);
            res.send(savedOrg);
        }
    });
    router.post('/updateOrg', isOrgAuthorityMiddleware, (req, res) => updateOrg(req.body, res));

    router.get('/myOrgsAdmins', nocacheMiddleware, async (req, res) => {
        const result = await myOrgsAdmins(req.user);
        res.send(result);
    });

    router.get('/orgAdmins', nocacheMiddleware, isOrgAuthorityMiddleware, async (req, res) => {
        const result = await orgAdmins();
        res.send(result);
    });
    router.post('/addOrgAdmin', isOrgAdminMiddleware, addOrgAdmin);
    router.post('/removeOrgAdmin', isOrgAdminMiddleware, removeOrgAdmin);

    router.get('/orgCurators', nocacheMiddleware, isOrgAdminMiddleware, orgCurators);
    router.post('/addOrgCurator', isOrgAdminMiddleware, addOrgCurator);
    router.post('/removeOrgCurator', isOrgAdminMiddleware, removeOrgCurator);

    router.get('/listOrgsDetailedInfo', nocacheMiddleware, async (req, res) => {
        const orgs = await listOrgsDetailedInfo();
        res.send(orgs);
    });

    router.post('/transferSteward', isOrgAdminMiddleware, transferSteward);

    return router;
}
