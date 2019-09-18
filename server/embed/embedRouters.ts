import { renderFile } from 'ejs';
import { promisify } from 'util';
import { access, constants, mkdir, writeFile } from 'fs';
import { consoleLog } from 'server/log/dbLogger';
import { isOrgAdminMiddleware, loggedInMiddleware } from 'server/system/authorization';
import { embeds } from 'server/embed/embedSvc';
import { handleError } from 'server/errorHandler/errorHandler';
import { isOrgAdmin } from 'shared/system/authorizationShared';
import { is } from 'useragent';

/* for IE Opera Safari, emit polyfill.js */
function isModernBrowser(req) {
    const ua = is(req.headers['user-agent']);
    return ua.chrome || ua.firefox || ua.edge;
}

export function module() {
    const router = require('express').Router();

    let embedHtml = '';
    renderFile('modules/_embedApp/embedApp.ejs', {isLegacy: false}, (err, str) => {
        embedHtml = str;
    });

    let embedLegacyHtml = '';
    renderFile('modules/_embedApp/embedApp.ejs', {isLegacy: true}, (err, str) => {
        embedLegacyHtml = str;
        if (embedLegacyHtml) {
            promisify(access)('modules/_embedApp/public/html', constants.R_OK)
                .catch(() => promisify(mkdir)('modules/_embedApp/public/html', {recursive: true} as any)) // Node 12
                .then(() => {
                    writeFile('modules/_embedApp/public/html/index.html', embedLegacyHtml, err => {
                        if (err) {
                            console.log('ERROR generating /modules/_embedApp/public/html/index.html: ' + err);
                        }
                    });
                })
                .catch(err => consoleLog('Error getting folder modules/_embedApp/public: ', err));
        }
    });

    router.get('/embedSearch', (req, res) => {
        res.send(isModernBrowser(req) ? embedHtml : embedLegacyHtml);
    });


    router.post('/embed/', isOrgAdminMiddleware, (req, res) => {
        const handlerOptions = {req, res, publicMessage: 'There was an error saving this embed.'};
        embeds.save(req.body, handleError(handlerOptions, embed => {
            res.send(embed);
        }));
    });

    router.delete('/embed/:id', loggedInMiddleware, (req, res) => {
        const handlerOptions = {req, res, publicMessage: 'There was an error removing this embed.'};
        embeds.find({_id: req.params.id}, handleError(handlerOptions, embedsData => {
            if (embedsData.length !== 1) {
                res.status.send('Expectation not met: one document.');
                return;
            }
            if (!req.isAuthenticated() || !isOrgAdmin(req.user, embedsData[0].org)) {
                res.status(403).send();
                return;
            }
            embeds.delete(req.params.id, handleError(handlerOptions, () => res.send()));
        }));
    });

    router.get('/embed/:id', (req, res) => {
        embeds.find({_id: req.params.id}, handleError({req, res}, embedsData => {
            if (embedsData.length !== 1) {
                res.status.send('Expectation not met: one document.');
                return;
            }
            res.send(embedsData[0]);
        }));

    });

    router.get('/embeds/:org', (req, res) => {
        embeds.find({org: req.params.org}, handleError({req, res}, embedsData => {
            res.send(embedsData);
        }));
    });
}
