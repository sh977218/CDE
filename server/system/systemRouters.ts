import { CronJob } from 'cron';
import * as csrf from 'csurf';
import { Request, Response, Router } from 'express';
import { union, uniq } from 'lodash';
import { GridFSFile } from 'mongodb';
import { Cursor, QueryOptions } from 'mongoose';
import { config, ObjectId } from 'server';
import { respondError } from 'server/errorHandler';
import { draftsList as deDraftsList } from 'server/cde/mongo-cde';
import { draftsList as formDraftsList } from 'server/form/mongo-form';
import { syncLinkedForms } from 'server/form/syncLinkedForms';
import { consoleLog, loginModel } from 'server/log/dbLogger';
import { syncWithMesh } from 'server/mesh/elastic';
import { addFile, getFileAndRespond, gfs } from 'server/mongo/mongo/gfs';
import { DataElementDocument, dataElementModel } from 'server/mongo/mongoose/dataElement.mongoose';
import { FormDocument, formModel } from 'server/mongo/mongoose/form.mongoose';
import { myOrgs } from 'server/orgManagement/orgSvc';
import { status } from 'server/siteAdmin/status';
import {
    isOrgAuthorityMiddleware,
    isOrgCuratorMiddleware,
    isSiteAdminMiddleware,
    loggedInMiddleware,
    nocacheMiddleware,
} from 'server/system/authorization';
import { deleteIndex, elasticsearchInfo, reIndex } from 'server/system/elastic';
import { indices } from 'server/system/elasticSearchInit';
import {
    createIdSource,
    deleteIdSource,
    getAllIdSources,
    isSourceById,
    updateIdSource,
} from 'server/system/idSourceSvc';
import { jobStatus, removeJobStatus, updateJobStatus } from 'server/system/mongo-data';
import { getRealIp, getTrafficFilter } from 'server/system/trafficFilterSvc';
import { byId, usersByName } from 'server/user/userDb';
import { version } from 'server/version';
import { removeFromArrayBy } from 'shared/array';
import {
    IdSourceGetResponse,
    IdSourcePutResponse,
    IdSourceRequest,
    IdSourceResponse,
    IdSourcesResponse,
} from 'shared/boundaryInterfaces/API/system';
import { flattenFormElement } from 'shared/form/fe';
import { CbError } from 'shared/models.model';
import { Readable } from 'stream';
import { promisify } from 'util';

require('express-async-errors');
const passport = require('passport'); // must use require to preserve this pointer

export function module() {
    const router = Router();

    router.get('/site-version', (req, res) => res.send(version));

    router.get('/status/cde', status); // used for DevOps health check API (heartbeat), has a HTTPS redirect bypass

    new CronJob('00 00 4 * * *', () => syncWithMesh(), null, true, 'America/New_York').start();

    // every hour
    new CronJob(
        '0 */60 * * * *',
        async () => {
            consoleLog(`Running sync isBundle & partOfBundles at ${new Date()}`);
            const cdesPartOfBundle: DataElementDocument[] = await dataElementModel.find({
                partOfBundles: { $exists: true, $not: { $size: 0 } },
                archived: false,
            });
            const cdesToSave = [...cdesPartOfBundle];
            cdesPartOfBundle.forEach(c => (c.partOfBundles = []));
            const bundles = await formModel.find({ isBundle: true, archived: false });
            for (const bundle of bundles) {
                const questions = flattenFormElement(bundle);
                for (const question of questions) {
                    const tinyId = question.question.cde.tinyId;
                    let cde: DataElementDocument | undefined | null = cdesPartOfBundle.find(c => c.tinyId === tinyId);
                    if (!cde) {
                        cde = await dataElementModel.findOne({ tinyId, archived: false });
                        if (!cde) {
                            continue;
                        }
                        cdesToSave.push(cde);
                    }
                    cde.partOfBundles = uniq(union(cde.partOfBundles, [bundle.tinyId]));
                }
            }
            return Promise.all([...cdesToSave.map(c => c.save())]);
        },
        null,
        true,
        'America/New_York',
        undefined,
        true
    ).start();

    // every sunday at 4:07 AM
    new CronJob(
        '* 7 4 * * 6',
        () => {
            setTimeout(
                () => {
                    try {
                        jobStatus('SiteMap').then(
                            j => {
                                if (j) {
                                    return;
                                }
                                gfs.then(gfs =>
                                    gfs
                                        .find({ filename: '/app/sitemap.txt' })
                                        .toArray()
                                        .then(files => {
                                            const file = files[0];
                                            if (!!file && fileCreatedToday(file)) {
                                                return;
                                            }
                                            updateJobStatus('SiteMap', 'Generating');
                                            consoleLog('Creating sitemap');
                                            const readable = new Readable();
                                            const siteMapLines: string[] = [];
                                            const cond = {
                                                archived: false,
                                                'registrationState.registrationStatus': 'Qualified',
                                            };

                                            function handleStream(
                                                stream: Cursor<DataElementDocument | FormDocument, QueryOptions>,
                                                formatter: (doc: DataElementDocument | FormDocument) => string,
                                                cb: CbError
                                            ) {
                                                stream.on('data', doc => siteMapLines.push(formatter(doc)));
                                                stream.on('err', cb);
                                                stream.on('end', cb);
                                            }

                                            return Promise.all([
                                                promisify(handleStream)(
                                                    dataElementModel.find(cond, 'tinyId').cursor(),
                                                    doc => config.publicUrl + '/deView?tinyId=' + doc.tinyId
                                                ),
                                                promisify(handleStream)(
                                                    formModel.find(cond, 'tinyId').cursor(),
                                                    doc => config.publicUrl + '/formView?tinyId=' + doc.tinyId
                                                ),
                                            ]).then(() => {
                                                readable.push(siteMapLines.join('\n'));
                                                readable.push(null);
                                                (file && file._id
                                                    ? gfs.delete(file._id).catch(err => {
                                                          consoleLog(
                                                              `Error removing old sitemap file: ${err}`,
                                                              'error'
                                                          );
                                                      })
                                                    : Promise.resolve()
                                                )
                                                    .then(() =>
                                                        addFile(
                                                            {
                                                                filename: '/app/sitemap.txt',
                                                                stream: readable,
                                                            },
                                                            {
                                                                contentType: 'plain/text',
                                                            }
                                                        )
                                                    )
                                                    .then(() => {
                                                        consoleLog('done with sitemap');
                                                        removeJobStatus('SiteMap');
                                                    })
                                                    .catch(err => {
                                                        consoleLog(`Error with sitemap file: ${err}`, 'error');
                                                    });
                                            });
                                        })
                                ).catch(err => {
                                    consoleLog(`Error finding sitemap file: ${err}`, 'error');
                                });
                            },
                            err => consoleLog(`Error getting SiteMap job status: ${err}`, 'error')
                        );
                    } catch (err) {
                        consoleLog('Cron Sunday 4:07 AM did not complete due to error: ' + err);
                        removeJobStatus('SiteMap');
                    }
                },
                process.env.NODE_ENV === 'dev-test' ? 0 : Math.floor(Math.random() * 3600000) + 1
            );
        },
        null,
        true,
        'America/New_York',
        undefined,
        true
    ).start();

    new CronJob('00 30 4 * * *', () => syncLinkedForms(), null, true, 'America/New_York').start();

    new CronJob(
        '0 0 1 * *',
        () => {
            loginModel.deleteMany({
                date: { $lt: new Date(new Date().getTime() - config.database.log.loginRecordRetentionTime) },
            });
        },
        null,
        true,
        'America/New_York',
        undefined,
        true
    ).start();

    function fileCreatedToday(file: GridFSFile): boolean {
        const today = new Date();
        return (
            file.uploadDate.getDate() === today.getDate() &&
            file.uploadDate.getMonth() === today.getMonth() &&
            file.uploadDate.getFullYear() === today.getFullYear()
        );
    }

    router.get('/jobStatus/:type', (req, res) => {
        const jobType = req.params.type;
        if (!jobType) {
            return res.status(400).end();
        }
        jobStatus(jobType).then(
            j => {
                if (j) {
                    return res.send({ done: false });
                }
                res.send({ done: true });
            },
            err => {
                res.status(409).send('Error - job status ' + jobType);
            }
        );
    });

    /* ---------- PUT NEW REST API above ---------- */

    router.get('/indexCurrentNumDoc/:indexPosition', isSiteAdminMiddleware, (req, res) => {
        const index = indices[+req.params.indexPosition];
        return res.send({ count: index.count, totalCount: index.totalCount });
    });

    router.get('/esVersion', isSiteAdminMiddleware, async (req, res) => {
        const esInfo = await elasticsearchInfo();
        res.send(esInfo.version);
    });

    router.post('/reindex/:indexPosition', isSiteAdminMiddleware, (req, res) => {
        const index = indices[+req.params.indexPosition];
        const reIndexCb = () => {
            reIndex(index, () => {
                setTimeout(() => {
                    index.count = 0;
                    index.totalCount = 0;
                }, 5000);
            });
        };
        if (req.body.deleteIndex) {
            deleteIndex(index, reIndexCb);
        } else {
            reIndexCb();
        }
        return res.send();
    });

    const failedIps: { ip: string; nb: number }[] = [];

    router.get('/csrf', csrf(), nocacheMiddleware, (req, res) => {
        const resp: { csrf: string; showCaptcha?: boolean } = { csrf: req.csrfToken() };
        const realIp = getRealIp(req);
        const failedIp = findFailedIp(realIp);
        if (failedIp && failedIp.nb > 2) {
            resp.showCaptcha = true;
        }
        res.send(resp);
    });

    function findFailedIp(ip: string) {
        return failedIps.filter(f => f.ip === ip)[0];
    }

    router.post('/logout', (req, res) => {
        if (!req.session) {
            return res.status(403).end();
        }
        res.clearCookie('Bearer');
        res.send();
    });

    router.get('/user/:search', nocacheMiddleware, loggedInMiddleware, (req, res): Response | Promise<Response> => {
        if (!req.params.search) {
            return res.send({});
        } else if (req.params.search === 'me') {
            return byId(req.user._id).then(user => res.send(user), respondError({ req, res }));
        } else {
            return usersByName(req.params.search).then(users => res.send(users), respondError({ req, res }));
        }
    });

    router.get('/data/:id', (req, res) => {
        let fileId = req.params.id;
        const i = fileId.indexOf('.');
        if (i > -1) {
            fileId = fileId.substr(0, i);
        }
        getFileAndRespond({ _id: new ObjectId(fileId) }, res);
    });

    router.get('/activeBans', isSiteAdminMiddleware, async (req, res) => {
        const list = await getTrafficFilter();
        res.send(list);
    });

    router.post('/removeBan', isSiteAdminMiddleware, async (req, res) => {
        const elt = await getTrafficFilter();
        if (removeFromArrayBy(elt.ipList, r => r.ip === req.body.ip)) {
            await elt.save();
        }
        res.send();
    });

    // drafts
    router.get('/allDrafts', isOrgAuthorityMiddleware, (req, res) => {
        getDrafts(req, res, {});
    });

    router.get('/orgDrafts', isOrgCuratorMiddleware, (req, res) => {
        getDrafts(req, res, { 'stewardOrg.name': { $in: myOrgs(req.user) } });
    });

    router.get('/myDrafts', isOrgCuratorMiddleware, (req, res) => {
        getDrafts(req, res, { 'updatedBy.username': req.user.username });
    });

    function getDrafts(req: Request, res: Response, criteria: any) {
        Promise.all([deDraftsList(criteria), formDraftsList(criteria)])
            .then(results => res.send({ draftCdes: results[0], draftForms: results[1] }))
            .catch(err => respondError({ req, res })(err));
    }

    /**** id sources ****/
    router.get('/idSource/:id', async (req, res) => {
        res.send((await isSourceById(req.params.id)) as IdSourceGetResponse);
    });

    router.post('/idSource/:id', isSiteAdminMiddleware, async (req, res) => {
        const input: IdSourceRequest = req.body;
        const sourceId = req.params.id;
        const foundSource = await isSourceById(sourceId);
        if (foundSource) {
            res.status(409).send(sourceId + ' already exists.');
            return;
        }
        res.send((await createIdSource(sourceId, input)) as IdSourceResponse);
    });

    router.put('/idSource/:id', isSiteAdminMiddleware, async (req, res) => {
        const sourceId = req.params.id;
        const input: IdSourceRequest = req.body;
        const foundSource = await isSourceById(sourceId);
        if (!foundSource) {
            res.status(409).send(sourceId + ' does not exist.');
            return;
        }
        res.send((await updateIdSource(sourceId, input)) as IdSourcePutResponse);
    });

    router.delete('/idSource/:id', isSiteAdminMiddleware, async (req, res) => {
        await deleteIdSource(req.params.id);
        res.send();
    });

    router.get('/idSources', async (req, res) => {
        res.send((await getAllIdSources()) as IdSourcesResponse);
    });

    return router;
}
