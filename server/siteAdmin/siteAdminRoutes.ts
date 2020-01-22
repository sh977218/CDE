import { Router } from 'express';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import { getStatus } from 'server/siteAdmin/status';
import { indices } from 'server/system/elasticSearchInit';
import { orgAuthorities, siteAdmins, userByUsername, UserDocument, usernamesByIp } from 'server/user/userDb';

export function module() {
    const router = Router();

    router.post('/addSiteAdmin', (req, res) => {
        const username = req.body.username;
        if (!username) {
            return res.status(422).send();
        }
        userByUsername(username, handleNotFound({req, res}, user => {
            user.siteAdmin = true;
            user.save(handleError<UserDocument>({req, res}, () => res.send()));
        }));
    });

    router.post('/removeSiteAdmin', (req, res) => {
        const username = req.body.username;
        if (!username) {
            return res.status(422).send();
        }
        userByUsername(username, handleNotFound({req, res}, user => {
            user.siteAdmin = false;
            user.save(handleError<UserDocument>({req, res}, () => res.send()));
        }));
    });

    router.get('/siteAdmins', (req, res) => siteAdmins(handleError({req, res},
        users => res.send(users))));

    router.get('/orgAuthorities', (req, res) => orgAuthorities(handleError({req, res},
        users => res.send(users))));

    router.get('/serverStatuses', (req, res) => {
        getStatus(() => res.send({esIndices: indices}));
    });

    router.get('/usernamesByIp/:ip', (req, res) => {
        usernamesByIp(req.params.ip, handleError({req, res}, result => res.send(result)));
    });

    return router;
}
