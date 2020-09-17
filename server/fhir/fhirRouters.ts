import { Request, Router } from 'express';
import { fhirApps, fhirObservationInfo } from 'server/fhir/fhirSvc';
import { isSiteAdminMiddleware, loggedInMiddleware } from 'server/system/authorization';
import { join } from 'path';
import { renderFile } from 'ejs';
import { is } from 'useragent';
import { version } from '../version';

/* for IE Opera Safari, emit polyfill.js */
function isModernBrowser(req: Request) {
    const ua = is(req.headers['user-agent']);
    return ua.chrome || ua.firefox || (ua as any).edge;
}

export function module() {
    const router = Router();

    let fhirHtml = '';
    renderFile('frontEnd/_fhirApp/fhirApp.ejs', {isLegacy: false, version}, (err, str) => fhirHtml = str);

    let fhirLegacyHtml = '';
    renderFile('frontEnd/_fhirApp/fhirApp.ejs', {isLegacy: true, version}, (err, str) => fhirLegacyHtml = str);

    router.get('/server/fhirApps', (req, res) => fhirApps.find(res, {}, apps => res.send(apps)));
    router.get('/server/fhirApp/:id', (req, res) => fhirApps.get(res, req.params.id, app => res.send(app)));
    router.post('/server/fhirApp', isSiteAdminMiddleware, (req, res) => fhirApps.save(res, req.body, app => res.send(app)));
    router.delete('/server/fhirApp/:id', isSiteAdminMiddleware, (req, res) => fhirApps.delete(res, req.params.id, () => res.send()));

    router.get('/fhir/form/:param', (req, res) => res.send(isModernBrowser(req) ? fhirHtml : fhirLegacyHtml));

    router.get('/server/fhir/fhirObservationInfo', (req, res) => {
        fhirObservationInfo.get(res, req.query.id, info => res.send(info));
    });

    router.put('/server/fhir/fhirObservationInfo', loggedInMiddleware, (req, res) => {
        fhirObservationInfo.put(res, req.body, info => res.send(info));
    });

    return router;
}
