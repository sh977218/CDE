const app_status = require("./status.js");

const handleError = require('../log/dbLogger').handleError;

const userDb = require('../user/userDb');
const clusterStatusDb = require('./clusterStatusDb');
const esInit = require('../system/elasticSearchInit');

exports.module = function () {
    const router = require('express').Router();

    router.post('/addSiteAdmin', (req, res) => {
        let username = req.body.username;
        if (!username) return res.status(400).send();
        userDb.userByUsername(username, handleError({req, res}, user => {
            if (!user) return res.send("Unknown Username");
            user.siteAdmin = true;
            user.save(handleError({req, res}, () => res.send("User Added")));
        }));
    });

    router.post('/removeSiteAdmin', (req, res) => {
        let username = req.body.username;
        if (!username) return res.status(400).send();
        userDb.userByUsername(username, handleError({req, res}, user => {
            if (!user) return res.send("Unknown Username");
            user.siteAdmin = false;
            user.save(handleError({req, res}, () => res.send()));
        }));
    });

    router.get('/siteAdmins', (req, res) => userDb.siteAdmins(handleError({req, res},
        users => res.send(users))));

    router.get('/orgAuthorities', (req, res) => userDb.orgAuthorities(handleError({req, res},
        users => res.send(users))));

    router.get('/serverStatuses', (req, res) => {
        app_status.getStatus(() => {
            clusterStatusDb.getClusterHostStatuses((err, statuses) => {
                return res.send({esIndices: esInit.indices, statuses: statuses});
            });
        });
    });


    router.get('/usernamesByIp/:ip', (req, res) => {
        userDb.usernamesByIp(req.params.ip, handleError({req, res}, result => res.send(result)));
    });

    return router;
};
