import { fhirApps, fhirObservationInfo } from 'server/fhir/fhirSvc';
import { isSiteAdminMiddleware, loggedInMiddleware } from 'server/system/authorization';
import { join } from 'path';
import { renderFile } from 'ejs';
import { is } from 'useragent';

/* for IE Opera Safari, emit polyfill.js */
function isModernBrowser(req) {
    const ua = is(req.headers['user-agent']);
    return ua.chrome || ua.firefox || ua.edge;
}

export function module() {
    const router = require('express').Router();
    let version = 'local-dev';
    try {
        version = require('server/system/version.js').version;
    } catch (e) {
    }

    let fhirHtml = '';
    renderFile('modules/_fhirApp/fhirApp.ejs', {isLegacy: false, version}, (err, str) => fhirHtml = str);

    let fhirLegacyHtml = '';
    renderFile('modules/_fhirApp/fhirApp.ejs', {isLegacy: true, version}, (err, str) => fhirLegacyHtml = str);

    router.get('/fhirApps', (req, res) => fhirApps.find(res, {}, apps => res.send(apps)));
    router.get('/fhirApp/:id', (req, res) => fhirApps.get(res, req.params.id, app => res.send(app)));
    router.post('/fhirApp', isSiteAdminMiddleware,
        (req, res) => fhirApps.save(res, req.body, app => res.send(app)));
    router.delete('/fhirApp/:id', isSiteAdminMiddleware,
        (req, res) => fhirApps.delete(res, req.params.id, () => res.send()));

    router.get('/fhir/form/:param', (req, res) => res.send(isModernBrowser(req) ? fhirHtml : fhirLegacyHtml));

    router.get('/fhir/launch/:param', (req, res) => {
        res.sendFile(join(__dirname, '../../modules/_fhirApp', 'fhirAppLaunch.html'), undefined, err => {
            if (err) {
                res.sendStatus(404);
            }
        });
    });

    router.get('/fhirObservationInfo', (req, res) => {
        fhirObservationInfo.get(res, req.query.id, info => res.send(info));
    });

    router.put('/fhirObservationInfo', loggedInMiddleware, (req, res) => {
        fhirObservationInfo.put(res, req.body, info => res.send(info));
    });

    return router;
}
