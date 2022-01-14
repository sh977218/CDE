import { Router } from 'express';
import { handleError, handleNotFound } from 'server/errorHandler';
import { deleteEsIndex, getStatus } from 'server/siteAdmin/status';
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
        getStatus(/* istanbul ignore next */ () => res.send({esIndices: indices}));
    });

    router.delete('/deleteEsIndex', async (req, res) => {
        await deleteEsIndex(/* istanbul ignore next */ (result: string) => res.send(result));
    })

    router.get('/usernamesByIp/:ip', (req, res) => {
        usernamesByIp(req.params.ip, handleError({req, res}, result => res.send(result)));
    });

    return router;
}
