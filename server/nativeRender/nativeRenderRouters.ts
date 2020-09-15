import { renderFile } from 'ejs';
import { Request, Router } from 'express';
import { is } from 'useragent';
import {version } from '../version';

/* for IE Opera Safari, emit polyfill.js */
function isModernBrowser(req: Request) {
    const ua = is(req.headers['user-agent']);
    return ua.chrome || ua.firefox || (ua as any).edge;
}

export function module() {
    const router = Router();

    let nativeRenderHtml = '';
    renderFile('frontEnd/_nativeRenderApp/nativeRenderApp.ejs', {isLegacy: false, version}, (err, str) => {
        nativeRenderHtml = str;
    });

    let nativeRenderLegacyHtml = '';
    renderFile('frontEnd/_nativeRenderApp/nativeRenderApp.ejs', {isLegacy: true, version}, (err, str) => {
        nativeRenderLegacyHtml = str;
    });
    router.get('/', (req, res) => {
        res.send(isModernBrowser(req) ? nativeRenderHtml : nativeRenderLegacyHtml);
    });

    return router;
}
