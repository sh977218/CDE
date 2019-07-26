import { handle40x, handleError } from '../errorHandler/errorHandler';

const app_status = require("./status");
const userDb = require('../user/userDb');
const esInit = require('../system/elasticSearchInit');

export function module() {
    const router = require('express').Router();

    router.post('/addSiteAdmin', (req, res) => {
        const username = req.body.username;
        if (!username) return res.status(422).send();
        userDb.userByUsername(username, handle40x({req, res}, user => {
            user.siteAdmin = true;
            user.save(handleError({req, res}, () => res.send()));
        }));
    });

    router.post('/removeSiteAdmin', (req, res) => {
        const username = req.body.username;
        if (!username) return res.status(422).send();
        userDb.userByUsername(username, handle40x({req, res}, user => {
            user.siteAdmin = false;
            user.save(handleError({req, res}, () => res.send()));
        }));
    });

    router.get('/siteAdmins', (req, res) => userDb.siteAdmins(handleError({req, res},
        users => res.send(users))));

    router.get('/orgAuthorities', (req, res) => userDb.orgAuthorities(handleError({req, res},
        users => res.send(users))));

    router.get('/serverStatuses', (req, res) => {
        app_status.getStatus(() => res.send({esIndices: esInit.indices}));
    });

    router.get('/usernamesByIp/:ip', (req, res) => {
        userDb.usernamesByIp(req.params.ip, handleError({req, res}, result => res.send(result)));
    });

    return router;
}
