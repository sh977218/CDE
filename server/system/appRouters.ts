import { is } from 'useragent';
import { renderFile } from 'ejs';
import * as csrf from 'csurf';
import { existsSync, writeFileSync } from 'fs';
import { Request, Response, Router } from 'express';

import { config } from 'server/system/parseConfig';
import { version } from 'server/version';
import { isSearchEngine } from 'server/system/helper';


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
    function isModernBrowser(req) {
        const ua = is(req.headers['user-agent']);
        return ua.chrome || ua.firefox || (ua as any).edge;
    }

    respondHomeFull = function getIndexHtml(req, res) {
        res.send(isModernBrowser(req) ? indexHtml : indexLegacyHtml);
    };

    router.get(['/', '/home'], (req, res) => {
        if (isSearchEngine(req)) {
            res.render('bot/home', 'system' as any);
        } else if (req.user || req.query.tour || req.query.notifications !== undefined
            || req.headers.referer && req.headers.referer.endsWith('/sw.js')) {
            respondHomeFull(req, res);
        } else {
            res.send(homeHtml);
        }
    });

    router.get('/tour', (req, res) => res.redirect('/home?tour=yes'));

    router.get('/site-version', (req, res) => res.send(version));

    router.get(['/help/:title', '/createForm', '/createCde', '/boardList',
            '/board/:id', '/myBoards', '/cdeStatusReport', '/api', '/sdcview', '/404', '/whatsNew', '/contactUs',
            '/quickBoard', '/searchPreferences', '/siteAudit', '/siteAccountManagement', '/orgAccountManagement',
            '/classificationManagement', '/profile', '/login', '/orgAuthority', '/orgComments'],
        respondHomeFull
    );

    router.get('/sw.js', (req, res) => {
        res.sendFile((global as any).appDir('dist/app', 'sw.js'), undefined, err => {
            if (err) {
                res.sendStatus(404);
            }
        });
    });

    router.get('/supportedBrowsers', (req, res) => res.render('supportedBrowsers', 'system' as any));

    router.get('/loginText', csrf(), (req, res) => res.render('loginText', 'system' as any, {csrftoken: req.csrfToken()} as any));

    return router;
}
