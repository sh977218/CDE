import * as fs from 'fs';
import { Request, Response, Router } from 'express';
import { dbPlugins } from 'server';
import { getFileAndRespond } from 'server/mongo/mongo/gfs';
import { isNlmCuratorMiddleware } from 'server/system/authorization';
import { isSearchEngine } from 'server/system/helper';
import { version } from 'server/version';
import {
    HomepageDraftGetResponse,
    HomepageDraftPutRequest,
    HomepageDraftPutResponse,
    HomepageGetResponse,
    HomepagePutRequest,
    HomepagePutResponse,
} from 'shared/boundaryInterfaces/API/system';
import { SingletonServer as Singleton } from 'shared/singleton.model';
import * as path from 'path';
import { attachmentRoutes } from 'server/attachment/attachmentSvc';

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
        return dbPlugins.singleton.byId('home').then(homeData => {
            if (homeData) {
                (homeData as any)._id = undefined;
            }
            return res.send(homeData as HomepageGetResponse);
        });
    });

    function addId<T, U>(t: T, u: U): T & { _id: U } {
        (t as T & { _id: U })._id = u;
        return t as T & { _id: U };
    }

    router.put('/server/home', isNlmCuratorMiddleware, (req, res): Promise<Response> => {
        const homepage: Singleton = addId(req.body as HomepagePutRequest, 'home');
        if (!homepage.body) {
            return Promise.resolve(res.status(400).send());
        }
        return dbPlugins.singleton
            .update('home', {}, req.user._id, homepage)
            .then(newHomepage => res.send(newHomepage as HomepagePutResponse));
    });

    attachmentRoutes(router, isNlmCuratorMiddleware, '/server/homeAttach', '/server/homeDetach');

    router.delete('/server/homeEdit', isNlmCuratorMiddleware, (req, res): Promise<Response> => {
        return dbPlugins.singleton.byId('homeEdit').then(draft => {
            return dbPlugins.singleton.deleteOneById('homeEdit').then(() => res.send());
        });
    });

    router.get('/server/homeEdit', isNlmCuratorMiddleware, (req, res): Promise<Response> => {
        return dbPlugins.singleton.byId('homeEdit').then(homeData => {
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
        type Req = Singleton | { updated: number; updateInProgress?: boolean };
        const homepage: Req = addId(req.body as HomepageDraftPutRequest, 'homeEdit') as Req;
        return dbPlugins.singleton.byId('homeEdit').then(draft => {
            let query = {};
            if (isSingleton(homepage)) {
                // save
                if (draft) {
                    if (homepage.updated !== draft.updated || draft.updatedBy.toString() !== req.user._id.toString()) {
                        return res.status(409).send();
                    }
                    query = { updated: draft.updated, updatedBy: draft.updatedBy };
                }
            } else {
                // metadata
                if (draft === null) {
                    return res.send();
                }
                if (homepage.updated) {
                    if (homepage.updated !== draft.updated) {
                        return res.status(409).send();
                    }
                    query = { updated: homepage.updated };
                }
            }
            delete (homepage as any).updated;
            return dbPlugins.singleton
                .update('homeEdit', query, req.user._id, homepage)
                .then(newHomepage => res.send(newHomepage as HomepageDraftPutResponse));
        });
    });

    router.get('/sitemap.txt', (req, res): Promise<Response> => {
        return getFileAndRespond({ filename: '/app/sitemap.txt' }, res);
    });

    router.get('/site-version', (req, res) => res.send(version));

    router.get('/data/:id', (req, res) => {
        const fileId = req.params.id;
        res.redirect('/server/system/data/' + fileId);
    });

    return router;
}
