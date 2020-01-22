import { renderFile } from 'ejs';
import { Request, Router } from 'express';
import { isOrgAdminMiddleware, loggedInMiddleware } from 'server/system/authorization';
import { embeds } from 'server/embed/embedSvc';
import { handleError } from 'server/errorHandler/errorHandler';
import { isOrgAdmin } from 'shared/system/authorizationShared';
import { is } from 'useragent';

/* for IE Opera Safari, emit polyfill.js */
function isModernBrowser(req: Request) {
    const ua = is(req.headers['user-agent']);
    return ua.chrome || ua.firefox || (ua as any).edge;
}

export function module() {
    const router = Router();

    let embedHtml = '';
    renderFile('frontEnd/_embedApp/embedApp.ejs', {isLegacy: false}, (err, str) => embedHtml = str);

    let embedLegacyHtml = '';
    renderFile('frontEnd/_embedApp/embedApp.ejs', {isLegacy: true}, (err, str) => embedLegacyHtml = str);

    router.post('/server/embed', isOrgAdminMiddleware, (req, res) => {
        const handlerOptions = {req, res, publicMessage: 'There was an error saving this embed.'};
        embeds.save(req.body, handleError(handlerOptions, embed => res.send(embed)));
    });

    router.delete('/server/embed/:id', loggedInMiddleware, (req, res) => {
        const handlerOptions = {req, res, publicMessage: 'There was an error removing this embed.'};
        embeds.find({_id: req.params.id}, handleError(handlerOptions, embedsData => {
            if (!embedsData || embedsData.length !== 1) {
                res.status(422).send('Expectation not met: one document.');
                return;
            }
            if (!req.isAuthenticated() || !isOrgAdmin(req.user, embedsData[0].org)) {
                res.status(403).send();
                return;
            }
            embeds.delete(req.params.id, handleError(handlerOptions, () => res.send()));
        }));
    });

    router.get('/server/embed/:id', (req, res) => {
        embeds.find({_id: req.params.id}, handleError({req, res}, embedsData => {
            if (!embedsData || embedsData.length !== 1) {
                res.sendStatus(404);
                return;
            }
            res.send(embedsData[0]);
        }));

    });

    router.get('/server/embeds/:org', (req, res) => {
        embeds.find({org: req.params.org}, handleError({req, res}, embedsData => res.send(embedsData)));
    });

    router.use('/embedded/public/html/index.html', (req, res) => {
        res.removeHeader('x-frame-options');
        res.send(isModernBrowser(req) ? embedHtml : embedLegacyHtml);
    });

    return router;
}
