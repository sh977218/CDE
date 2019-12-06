import { is } from 'useragent';
import { series } from 'async';
import { renderFile } from 'ejs';
import { CronJob } from 'cron';
import { authenticate } from 'passport';
import * as csrf from 'csurf';
import { promisify } from 'util';
import { access, constants, createWriteStream, existsSync, mkdir, writeFileSync } from 'fs';
import { Request, Response, Router } from 'express';
import { handleError, respondError } from 'server/errorHandler/errorHandler';
import {
    isOrgAuthorityMiddleware, isOrgCuratorMiddleware, isSiteAdminMiddleware, loggedInMiddleware, nocacheMiddleware
} from 'server/system/authorization';
import { dataElementModel, draftsList as deDraftsList } from 'server/cde/mongo-cde';
import { draftsList as formDraftsList, formModel } from 'server/form/mongo-form';
import { myOrgs } from 'server/orgManagement/orgSvc';
import { disableRule, enableRule } from 'server/system/systemSvc';
import { banIp, getRealIp, getTrafficFilter } from 'server/system/trafficFilterSvc';
import { getClassificationAuditLog } from 'server/system/classificationAuditSvc';
import { orgByName } from 'server/orgManagement/orgDb';
import {
    createIdSource, deleteIdSource, getAllIdSources, isSourceById, updateIdSource
} from 'server/system/idSourceSvc';
import { config } from 'server/system/parseConfig';
import { version } from 'server/version';
import { isSearchEngine } from 'server/system/helper';
import { syncWithMesh } from 'server/mesh/elastic';
import { consoleLog } from 'server/log/dbLogger';
import { getFile, jobStatus } from 'server/system/mongo-data';
import { indices } from 'server/system/elasticSearchInit';
import { reIndex } from 'server/system/elastic';
import { userById, usersByName } from 'server/user/userDb';

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

    const failedIps: any[] = [];

    router.get('/csrf', csrf(), nocacheMiddleware, (req, res) => {
        const resp: any = {csrf: req.csrfToken()};
        const realIp = getRealIp(req);
        const failedIp = findFailedIp(realIp);
        if ((failedIp && failedIp.nb > 2)) {
            resp.showCaptcha = true;
        }
        res.send(resp);
    });

    function findFailedIp(ip) {
        return failedIps.filter(f => f.ip === ip)[0];
    }
    return router;
}
