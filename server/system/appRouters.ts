import { is } from 'useragent';
import { renderFile } from 'ejs';
import * as csrf from 'csurf';
import { Request, Response, Router } from 'express';
import { existsSync, writeFileSync } from 'fs';
import { isSearchEngine } from 'server/system/helper';
import { config } from 'server/system/parseConfig';
import { version } from 'server/version';
import { gfs } from './mongo-data';

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

    router.get('/sitemap.txt', (req, res) => {
        gfs.exist({filename: '/app/sitemap.txt'}, (err, found) => {
            if (err || !found) {
                res.status(404).send('File not found.');
            } else {
                gfs.findOne({filename: '/app/sitemap.txt'}, (err, file) => {
                    gfs.createReadStream({filename: '/app/sitemap.txt'}).pipe(res);
                });
            }
        });
    });

    router.get('/tour', (req, res) => res.redirect('/home?tour=yes'));

    router.get('/site-version', (req, res) => res.send(version));

    router.get('/sw.js', (req, res) => {
        res.sendFile(global.appDir('dist/app', 'sw.js'), undefined, err => {
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
