import { CronJob } from 'cron';
import { Request, RequestHandler, Response } from 'express';
import { authenticate } from 'passport';
import * as csrf from 'csurf';
import { promisify } from 'util';
import { access, constants, createWriteStream, mkdir } from 'fs';
import { Router } from 'express';
import { QueryCursor } from 'mongoose';
import { handleError, respondError } from 'server/errorHandler/errorHandler';
import {
    isOrgAuthorityMiddleware, isOrgCuratorMiddleware, isSiteAdminMiddleware, loggedInMiddleware, nocacheMiddleware
} from 'server/system/authorization';
import { dataElementModel, draftsList as deDraftsList } from 'server/cde/mongo-cde';
import { draftsList as formDraftsList, formModel } from 'server/form/mongo-form';
import { myOrgs } from 'server/orgManagement/orgSvc';
import { getRealIp, getTrafficFilter } from 'server/system/trafficFilterSvc';
import { getClassificationAuditLog } from 'server/system/classificationAuditSvc';
import { orgByName } from 'server/orgManagement/orgDb';
import {
    createIdSource, deleteIdSource, getAllIdSources, isSourceById, updateIdSource
} from 'server/system/idSourceSvc';
import { config } from 'server/system/parseConfig';
import { version } from 'server/version';
import { syncWithMesh } from 'server/mesh/elastic';
import { consoleLog } from 'server/log/dbLogger';
import { getFile, ItemDocument, jobStatus } from 'server/system/mongo-data';
import { indices } from 'server/system/elasticSearchInit';
import { reIndex } from 'server/system/elastic';
import { userById, usersByName } from 'server/user/userDb';
import { status } from 'server/siteAdmin/status';
import { CbError } from 'shared/models.model';

require('express-async-errors');

export function module() {
    const router = Router();

    router.get('/site-version', (req, res) => res.send(version));

    router.get('/status/cde', status);

    new CronJob('00 00 4 * * *', () => syncWithMesh(), null, true, 'America/New_York').start();

    // every sunday at 4:07 AM
    new CronJob('* 7 4 * * 6', () => {
        consoleLog('Creating sitemap');
        promisify(access)('dist/app', constants.R_OK)
            .catch(() => promisify(mkdir)('dist/app', {recursive: true})) // Node 12
            .then(() => {
                const wstream = createWriteStream('./dist/app/sitemap.txt');
                const cond = {
                    archived: false,
                    'registrationState.registrationStatus': 'Qualified'
                };

                function handleStream(stream: QueryCursor<ItemDocument>, formatter: (doc: ItemDocument) => string, cb: CbError) {
                    stream.on('data', doc => wstream.write(formatter(doc)));
                    stream.on('err', cb);
                    stream.on('end', cb);
                }

                Promise.all([
                    promisify(handleStream)(
                        dataElementModel.find(cond, 'tinyId').cursor(),
                        doc => config.publicUrl + '/deView?tinyId=' + doc.tinyId + '\n'
                    ),
                    promisify(handleStream)(
                        formModel.find(cond, 'tinyId').cursor(),
                        doc => config.publicUrl + '/formView?tinyId=' + doc.tinyId + '\n'
                    )
                ]).then(() => {
                    consoleLog('done with sitemap');
                    wstream.end();
                });
            })
            .catch((err: string) => consoleLog('Cron Sunday 4:07 AM did not complete due to error: ' + err));
    }, null, true, 'America/New_York', undefined, true).start();

    router.get('/jobStatus/:type', (req, res) => {
        const jobType = req.params.type;
        if (!jobType) {
            return res.status(400).end();
        }
        jobStatus(jobType, (err, j) => {
            if (err) {
                return res.status(409).send('Error - job status ' + jobType);
            }
            if (j) {
                return res.send({done: false});
            }
            res.send({done: true});
        });
    });

    /* ---------- PUT NEW REST API above ---------- */

    router.get('/indexCurrentNumDoc/:indexPosition', isSiteAdminMiddleware, (req, res) => {
        const index = indices[+req.params.indexPosition];
        return res.send({count: index.count, totalCount: index.totalCount});
    });

    router.post('/reindex/:indexPosition', isSiteAdminMiddleware, (req, res) => {
        const index = indices[+req.params.indexPosition];
        reIndex(index, () => {
            setTimeout(() => {
                index.count = 0;
                index.totalCount = 0;
            }, 5000);
        });
        return res.send();
    });

    const failedIps: { ip: string, nb: number }[] = [];

    router.get('/csrf', csrf(), nocacheMiddleware, (req, res) => {
        const resp: { csrf: string, showCaptcha?: boolean } = {csrf: req.csrfToken()};
        const realIp = getRealIp(req);
        const failedIp = findFailedIp(realIp);
        if ((failedIp && failedIp.nb > 2)) {
            resp.showCaptcha = true;
        }
        res.send(resp);
    });

    function findFailedIp(ip: string) {
        return failedIps.filter(f => f.ip === ip)[0];
    }

    const myCsrf: RequestHandler = function myCsrf(req, res, next) {
        if (req.body.federated) {
            return next();
        }
        if (!req.body._csrf) {
            return res.status(401).send();
        }
        csrf()(req, res, next);
    }

    // const checkLoginReq: RequestHandler = async function checkLoginReq(req, res, next) {
    //     if (req.body.federated) {
    //         return next();
    //     }
    //     const realIp = getRealIp(req);
    //     if (Object.keys(req.body).filter(k => validLoginBody.indexOf(k) === -1).length) {
    //         await banIp(realIp, 'Invalid Login body');
    //         return res.status(401).send();
    //     }
    //     if (Object.keys(req.query).length) {
    //         await banIp(realIp, 'Passing params to /login');
    //         return res.status(401).send();
    //     }
    //     return next();
    // }

    const validLoginBody = ['username', 'password', '_csrf', 'recaptcha'];

    router.post('/login', /*checkLoginReq,*/ myCsrf, (req, res, next) => {
        const failedIp = findFailedIp(getRealIp(req));
        if (failedIp && failedIp.nb > 2) {
            return res.status(412).send('Failed too many times');
        }
        if (failedIp) {
            failedIp.nb = 0;
        }
        // Regenerate is used so appscan won't complain
        if (req.session) {
            req.session.regenerate(passportAuthenticate);
        } else {
            passportAuthenticate();
        }

        function passportAuthenticate() {
            authenticate('local', (err, user, info) => {
                if (err) {
                    respondError(err);
                    return res.status(403).send();
                }
                if (!user) {
                    if (failedIp && config.useCaptcha) {
                        failedIp.nb++;
                    } else {
                        failedIps.unshift({ip: getRealIp(req), nb: 1});
                        failedIps.length = 50;
                    }
                    return res.status(403).send(info);
                }
                req.logIn(user, err => {
                    if (err) {
                        respondError(err);
                        return res.status(403).send();
                    }
                    if (req.session) {
                        req.session.passport = {user: req.user._id};
                    }
                    return res.send('OK');
                });
            })(req, res, next);
        }
    });

    router.post('/logout', (req, res) => {
        if (!req.session) {
            return res.status(403).end();
        }
        req.session.destroy(() => {
            req.logout();
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    });

    router.get('/user/:search', nocacheMiddleware, loggedInMiddleware, (req, res) => {
        if (!req.params.search) {
            return res.send({});
        } else if (req.params.search === 'me') {
            userById(req.user._id, handleError({req, res}, user => res.send(user)));
        } else {
            usersByName(req.params.search, handleError({req, res}, users => res.send(users)));
        }
    });

    router.get('/data/:id', (req, res) => {
        let fileId = req.params.id;
        const i = fileId.indexOf('.');
        if (i > -1) {
            fileId = fileId.substr(0, i);
        }
        getFile(req.user, fileId, res);
    });


    router.post('/getClassificationAuditLog', isOrgAuthorityMiddleware, async (req, res) => {
        const records = await getClassificationAuditLog(req.body);
        res.send(records);
    });

    router.get('/activeBans', isSiteAdminMiddleware, async (req, res) => {
        const list = await getTrafficFilter();
        res.send(list);
    });

    router.post('/removeBan', isSiteAdminMiddleware, async (req, res) => {
        const elt = await getTrafficFilter();
        const foundIndex = elt.ipList.findIndex(r => r.ip === req.body.ip);
        if (foundIndex > -1) {
            elt.ipList.splice(foundIndex, 1);
            await elt.save();
        }
        res.send();
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

    function getDrafts(req: Request, res: Response, criteria: any) {
        Promise.all([deDraftsList(criteria), formDraftsList(criteria)])
            .then(results => res.send({draftCdes: results[0], draftForms: results[1]}))
            .catch(err => respondError(err, {req, res}));
    }

    // id sources
    router.get('/idSources', async (req, res) => {
        const sources = await getAllIdSources();
        res.send(sources);
    });

    router.get('/idSource/:id', async (req, res) => {
        const source = await isSourceById(req.params.id);
        res.send(source);
    });

    router.post('/idSource/:id', isSiteAdminMiddleware, async (req, res) => {
        const sourceId = req.params.id;
        const foundSource = await isSourceById(sourceId);
        if (foundSource) {
            return res.status(409).send(sourceId + ' already exists.');
        } else {
            const createdIdSource = await createIdSource(sourceId, req.body);
            res.send(createdIdSource);
        }
    });

    router.put('/idSource/:id', isSiteAdminMiddleware, async (req, res) => {
        const sourceId = req.params.id;
        const foundSource = await isSourceById(sourceId);
        if (!foundSource) {
            return res.status(409).send(sourceId + ' does not exist.');
        } else {
            const updatedIdSource = await updateIdSource(sourceId, req.body);
            res.send(updatedIdSource);
        }
    });

    router.delete('/idSource/:id', isSiteAdminMiddleware, async (req, res) => {
        await deleteIdSource(req.params.id);
        res.send();
    });

    return router;
}
