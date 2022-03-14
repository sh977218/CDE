import { is } from 'useragent';
import { renderFile } from 'ejs';
import * as csrf from 'csurf';
import { Request, Response, Router } from 'express';
import { existsSync, writeFileSync } from 'fs';
import * as md5 from 'md5';
import * as multer from 'multer';
import { config, dbPlugins } from 'server';
import { removeUnusedAttachment, scanFile } from 'server/attachment/attachmentSvc';
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

const createReadStream = require('streamifier').createReadStream;

require('express-async-errors');

export let respondHomeFull: (req: Request, res: Response) => any;

export function module() {
    const router = Router();

    let indexHtml = '';
    renderFile('modules/system/views/index.ejs', {
        config,
        isLegacy: false,
        version
    }, (err, str) => {
        indexHtml = str;
        if (existsSync('modules/_app')) {
            writeFileSync('modules/_app/index.html', indexHtml);
        }
    });


    let indexLegacyHtml = '';
    renderFile('modules/system/views/index.ejs', {config, isLegacy: true, version}, (err, str) => {
        indexLegacyHtml = str;
    });

    let homeHtml = '';
    renderFile('modules/system/views/home-launch.ejs', {config, version}, (err, str) => {
        homeHtml = str;
    });

    /* for IE Opera Safari, emit polyfill.js */
    function isModernBrowser(req: Request) {
        const ua = is(req.headers['user-agent']);
        return ua.chrome || ua.firefox || (ua as any).edge;
    }

    respondHomeFull = function getIndexHtml(req, res) {
        res.send(isModernBrowser(req) ? indexHtml : indexLegacyHtml);
    };

    router.get(['/', '/home'], (req, res) => {
        if (isSearchEngine(req)) {
            res.render('bot/home', 'system' as any);
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

    router.put('/server/home', isNlmCuratorMiddleware, (req, res): Promise<Response> => {
        const homepage: Singleton = req.body as HomepagePutRequest & {_id: string};
        (homepage as any)._id = 'home';
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
            const stream = createReadStream(fileBuffer);
            const streamFS1 = createReadStream(fileBuffer);
            return scanFile(stream).then(scanned => {
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
                            status: scanned ? 'approved' : 'uploaded',
                        }
                    }
                )
                    .then(newId => res.send({fileId: newId.toString()} as HomepageAttachResponse));
            });
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
        const homepage: Singleton | {updated: number, updateInProgress?: boolean}
            = req.body as HomepageDraftPutRequest & {_id: string} as any;
        (homepage as any)._id = 'homeEdit';
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

    router.get('/sw.js', (req, res) => {
        res.sendFile(global.assetDir('dist/app', 'sw.js'), undefined, err => {
            if (err) {
                res.sendStatus(404);
            }
        });
    });

    router.get('/data/:id', (req, res) => {
        const fileId = req.params.id;
        res.redirect('/server/system/data/' + fileId);
    });

    router.get('/supportedBrowsers', (req, res) => res.render('supportedBrowsers', 'system' as any));

    router.get('/loginFederated', (req, res) => {
        res.send(`
        <html>
            <head>
                <title>CDE Federated Login (Please wait)</title>
                <script>
                setTimeout(() => {
                    const startChild = document.createElement('p');
                    startChild.textContent = 'Loading...';
                    document.querySelector('body').appendChild(startChild);
                    if (window.location.search.startsWith('?')) {
                        const query = window.location.search.substr(1).split('&').map(x => x.split('='));
                        function getQuery(p) {
                            const r = query.filter(x => x[0] === p)[0];
                            return r && (r.length === 2 ? r[1] : true);
                        }
                        const ticket = getQuery('ticket');
                        if (ticket) {
                            const loginChild = document.createElement('p');
                            loginChild.textContent = 'Logging in...';
                            document.querySelector('body').appendChild(loginChild);
                            const body = {
                                    ticket,
                                    username: 'x',
                                    password: 'x',
                                    federated: true
                                };
                            if(window.location.href.indexOf('-green.') !== -1){
                                body.green = true;
                            }
                            fetch('/server/system/login', {
                                method: 'post',
                                headers: {
                                    'Content-type': 'application/json'
                                },
                                credentials: 'include',
                                body: JSON.stringify(body),
                            })
                                .then(res => res.text())
                                .then(text => {
                                    const authChild = document.createElement('p');
                                    authChild.textContent = 'done';
                                    document.querySelector('body').appendChild(authChild);
                                    const thisRoute = '/loginFederated';
                                    const service = window.location.href.substr(0, window.location.href.indexOf(thisRoute));
                                    console.log('text: '+ text + ' service: ' + service);
                                    if (text === 'OK' && service) {
                                        if (window.opener && window.opener.loggedIn) {
                                            try {
                                                window.opener.loggedIn();
                                                window.close();
                                            }
                                            catch (err) {
                                                const errorChild = document.createElement('p');
                                                errorChild.textContent = err;
                                                document.querySelector('body').appendChild(errorChild);

                                                const errorChild1 = document.createElement('p');
                                                errorChild1.textContent = 'Flat Catch: ' + JSON.stringify(err);
                                                document.querySelector('body').appendChild(errorChild1);
                                            }
                                        } else {
                                            const url = window.sessionStorage.getItem('nlmcde.lastRoute');
                                            if (url) {
                                                const savedQuery = window.sessionStorage.getItem('nlmcde.lastRouteQuery');
                                                window.sessionStorage.removeItem('nlmcde.lastRoute');
                                                window.sessionStorage.removeItem('nlmcde.lastRouteQuery');
                                                window.location.href = service + url + (savedQuery || '');
                                            } else {
                                                window.location.href = service + '/home';
                                            }
                                        }
                                    } else {
                                        const child = document.createElement('h1');
                                        child.textContent = 'Login Failed ' + ' text: '+ text + ' service: ' + service ;
                                        document.querySelector('body').appendChild(child);
                                    }
                                }, err => {
                                    const child = document.createElement('h1');
                                    child.textContent = 'Login Error';
                                    document.querySelector('body').appendChild(child);

                                    const errorChild = document.createElement('p');
                                    errorChild.textContent = err;
                                    document.querySelector('body').appendChild(errorChild);

                                    const errorChild1 = document.createElement('p');
                                    errorChild1.textContent = 'Flat: ' + JSON.stringify(err);
                                    document.querySelector('body').appendChild(errorChild1);
                                });
                        } else {
                            const child = document.createElement('h1');
                            child.textContent = 'Ticket Missing';
                            document.querySelector('body').appendChild(child);
                        }
                    } else {
                        const child = document.createElement('h1');
                        child.textContent = 'Ticket Param Missing';
                        document.querySelector('body').appendChild(child);
                    }
                }, 0);
                </script>
            </head>
            <body>
            </body>
        </html>
        `);
    });

    router.get('/loginText', csrf(), (req, res) => res.render('loginText', 'system' as any, {csrftoken: req.csrfToken()} as any));

    return router;
}
