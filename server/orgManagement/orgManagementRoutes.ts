import { isOrgAdminMiddleware, isOrgAuthorityMiddleware, nocacheMiddleware } from 'server/system/authorization';
import {
    addOrgAdmin, addOrganization, addOrgCurator, myOrgsAdmins, orgByName, orgCurators, removeOrgAdmin, removeOrgCurator,
    transferSteward, updateOrg
} from 'server/orgManagement/orgsvc';
import { isOrgAdmin } from 'shared/system/authorizationShared';
import { userByUsername } from 'server/user/userDb';
import { allOrganizations } from 'server/orgManagement/orgDb';

require('express-validator');

export function module() {
    const router = require('express').Router();

    router.get('/myOrgsAdmins', nocacheMiddleware, async (req, res) => {
        const orgAdmins = await myOrgsAdmins(req.user);
        res.send(orgAdmins);
    });


    router.get('/org/:name', nocacheMiddleware, async (req, res) => {
        const org = await orgByName(req.params.name);
        res.send(org);
    });
    router.post('/transferSteward', async (req, res) => {
        if (isOrgAdmin(req.user, req.body.from) && isOrgAdmin(req.user, req.body.to)) {
            const result = await transferSteward(req.body.from, req.body.to);
            res.send(result);
        } else {
            res.status(403).send();
        }
    });

    router.get('/allOrgs', async (req, res) => {
        const allOrgs = await allOrganizations();
        res.send(allOrgs);
    });
    router.post('/addOrg', isOrgAuthorityMiddleware, async (req, res) => {
        const savedOrg = await addOrganization(req.body);
        res.send(savedOrg);
    });
    router.post('/updateOrg', isOrgAuthorityMiddleware, async (req, res) => {
        const updatedOrg = await updateOrg(req.body);
        res.send(updatedOrg);
    });

    router.get('/orgAdmins', [nocacheMiddleware, isOrgAuthorityMiddleware], async (req, res) => {
        orgAdmins();
    });
    router.post('/addOrgAdmin', isOrgAdminMiddleware, async (req, res) => {
        const user = await userByUsername(req.body.username);
        await addOrgAdmin(user, req.body.org);
        res.send();
    });
    router.post('/removeOrgAdmin', isOrgAdminMiddleware, async (req, res) => {
        const user = await userByUsername(req.body.username);
        await removeOrgAdmin(user, req.body.org);
        res.send();
    });

    router.get('/orgCurators', [nocacheMiddleware, isOrgAdminMiddleware], async (req, res) => {
        orgCurators();
    });
    router.post('/addOrgCurator', isOrgAdminMiddleware, async (req, res) => {
        const user = await userByUsername(req.body.username);
        await addOrgCurator(user, req.body.org);
        res.send();
    });
    router.post('/removeOrgCurator', isOrgAdminMiddleware, async (req, res) => {
        await removeOrgCurator(req.user, req.body.org);
        res.send();
    });

    return router;
}
