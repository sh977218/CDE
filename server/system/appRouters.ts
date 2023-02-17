import * as fs from 'fs';
import { Request, Response, Router } from 'express';
import * as md5 from 'md5';
import * as multer from 'multer';
import { config, dbPlugins } from 'server';
import { removeUnusedAttachment } from 'server/attachment/attachmentSvc';
import { respondError } from 'server/errorHandler';
import { addFile, getFile, gfs } from 'server/mongo/mongo/gfs';
import { isNlmCuratorMiddleware } from 'server/system/authorization';
import { isSearchEngine } from 'server/system/helper';
import { FileCreateInfo } from 'server/system/mongo-data';
import { version } from 'server/version';
import {
    HomepageAttachResponse,
    HomepageDetachRequest, HomepageDraftGetResponse, HomepageDraftPutRequest, HomepageDraftPutResponse,
    HomepageGetResponse,
    HomepagePutRequest, HomepagePutResponse
} from 'shared/boundaryInterfaces/API/system';
import { SingletonServer as Singleton } from 'shared/singleton.model';
import * as path from 'path';

const createReadStream = require('streamifier').createReadStream;

require('express-async-errors');

export let respondHomeFull: (req: Request, res: Response) => any;

export function module() {
    const router = Router();

    let indexHtml = '';
    try {
        indexHtml = fs.readFileSync(path.join(process.cwd(), '/dist/cde-cli/index.html'), 'UTF-8');
    } catch (e) {
        console.error("Missing file index.html. Run 'ng build' and retry");
        process.exit(1);
    }
// replace version
    respondHomeFull = function getIndexHtml(req, res) {
        res.send(indexHtml);
    };

    router.get(['/', '/home'], (req, res) => {
        if (isSearchEngine(req)) {
            res.render('bot/home');
        } else {
            respondHomeFull(req, res);
        }
    });

    router.get('/home/edit', (req, res) => {
        respondHomeFull(req, res);
    });

    router.get('/server/home', (req, res): Promise<Response> => {
        return dbPlugins.singleton.byId('home')
            .then(homeData => {
                if (homeData) {
                    (homeData as any)._id = undefined;
                }
                return res.send(homeData as HomepageGetResponse);
            });
    });

    function addId<T, U>(t: T, u: U): T & {_id: U} {
        (t as T & {_id: U})._id = u;
        return t as T & {_id: U};
    }

    router.put('/server/home', isNlmCuratorMiddleware, (req, res): Promise<Response> => {
        const homepage: Singleton = addId(req.body as HomepagePutRequest, 'home');
        if (!homepage.body) {
            return Promise.resolve(res.status(400).send());
        }
        return dbPlugins.singleton.update('home', {}, req.user._id, homepage)
            .then((newHomepage) => res.send(newHomepage as HomepagePutResponse));
    });

    router.post('/server/homeAttach', isNlmCuratorMiddleware,
        multer({...config.multer, storage: multer.memoryStorage()}).any(),
        (req, res): Promise<Response> => {
            const file = (req.files as any)[0];
            const fileBuffer = file.buffer;
            const streamFS1 = createReadStream(fileBuffer);
            const fileCreate: FileCreateInfo = {
                filename: file.originalname,
                stream: streamFS1,
                md5: md5(fileBuffer),
            };
            return addFile(
                fileCreate,
                {
                    contentType: file.mimetype,
                    metadata: {
                        md5: fileCreate.md5,
                        status: 'approved',
                    }
                }
            )
                .then(newId => res.send({fileId: newId.toString()} as HomepageAttachResponse));
        }
    );

    router.post('/server/homeDetach', isNlmCuratorMiddleware, (req, res): Promise<Response> => {
        const body: HomepageDetachRequest = req.body;
        if (!body.fileId) {
            return Promise.resolve(res.send());
        }
        return removeUnusedAttachment(body.fileId)
            .then(() => res.send());
    });

    router.delete('/server/homeEdit', isNlmCuratorMiddleware, (req, res): Promise<Response> => {
        return dbPlugins.singleton.byId('homeEdit').then(draft => {
            return dbPlugins.singleton.deleteOneById('homeEdit')
                .then(() => res.send());
        });
    });

    router.get('/server/homeEdit', isNlmCuratorMiddleware, (req, res): Promise<Response> => {
        return dbPlugins.singleton.byId('homeEdit')
            .then(homeData => {
                if (homeData) {
                    (homeData as any)._id = undefined;
                }
                return res.send(homeData as HomepageDraftGetResponse);
            });
    });

    function isSingleton(s: any): s is Singleton {
        return !!s.body;
    }

    router.put('/server/homeEdit', isNlmCuratorMiddleware, (req, res): Promise<Response> => {
        type Req = Singleton | {updated: number, updateInProgress?: boolean};
        const homepage: Req = addId(req.body as HomepageDraftPutRequest, 'homeEdit') as Req;
        return dbPlugins.singleton.byId('homeEdit').then(draft => {
            let query = {};
            if (isSingleton(homepage)) { // save
                if (draft) {
                    if (homepage.updated !== draft.updated || draft.updatedBy.toString() !== req.user._id.toString()) {
                        return res.status(409).send();
                    }
                    query = {updated: draft.updated, updatedBy: draft.updatedBy};
                }
            } else { // metadata
                if (draft === null) {
                    return res.send();
                }
                if (homepage.updated) {
                    if (homepage.updated !== draft.updated) {
                        return res.status(409).send();
                    }
                    query = {updated: homepage.updated};
                }
            }
            delete (homepage as any).updated;
            return dbPlugins.singleton.update('homeEdit', query, req.user._id, homepage)
                .then((newHomepage) => res.send(newHomepage as HomepageDraftPutResponse));
        });
    });

    router.get('/sitemap.txt', (req, res): Promise<Response> => {
        return gfs.then(gfs => gfs.find({filename: '/app/sitemap.txt'}).toArray()).then(files => {
            const file = files[0];
            if (!file) {
                return res.status(404).send('File not found.');
            }
            return getFile(file._id, res);
        }, respondError({req, res}));
    });

    router.get('/tour', (req, res) => res.redirect('/home?tour=yes'));

    router.get('/site-version', (req, res) => res.send(version));

    router.get('/data/:id', (req, res) => {
        const fileId = req.params.id;
        res.redirect('/server/system/data/' + fileId);
    });

    return router;
}
