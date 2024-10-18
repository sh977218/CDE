import { Response, Router } from 'express';
import { respondError } from 'server/errorHandler';
import { deleteEsIndex, getStatus } from 'server/siteAdmin/status';
import { indices } from 'server/system/elasticSearchInit';
import { orgAuthorities, siteAdmins, userByUsername, usernamesByIp } from 'server/user/userDb';

export function module() {
    const router = Router();

    router.post('/addSiteAdmin', (req, res): Response | Promise<Response> => {
        const username = req.body.username;
        if (!username) {
            return res.status(422).send();
        }
        return userByUsername(username).then(user => {
            if (!user) {
                return res.status(404).send('Resource Not Found');
            }
            user.siteAdmin = true;
            return user.save().then(() => res.send(), respondError({ req, res }));
        }, respondError({ req, res }));
    });

    router.post('/removeSiteAdmin', (req, res): Response | Promise<Response> => {
        const username = req.body.username;
        if (!username) {
            return res.status(422).send();
        }
        return userByUsername(username).then(user => {
            if (!user) {
                return res.status(404).send('Resource Not Found');
            }
            user.siteAdmin = false;
            return user.save().then(() => res.send(), respondError({ req, res }));
        }, respondError({ req, res }));
    });

    router.get(
        '/siteAdmins',
        (req, res): Promise<Response> => siteAdmins().then(users => res.send(users), respondError({ req, res }))
    );

    router.get(
        '/orgAuthorities',
        (req, res): Promise<Response> => orgAuthorities().then(users => res.send(users), respondError({ req, res }))
    );

    router.get('/serverStatuses', (req, res) =>
        getStatus(/* istanbul ignore next */ () => res.send({ esIndices: indices }))
    );

    router.delete('/deleteEsIndex', async (req, res) => {
        await deleteEsIndex(/* istanbul ignore next */ (result: string) => res.send(result));
    });

    router.get('/usernamesByIp/:ip', (req, res) => {
        usernamesByIp(req.params.ip).then(result => res.send(result), respondError({ req, res }));
    });

    return router;
}
