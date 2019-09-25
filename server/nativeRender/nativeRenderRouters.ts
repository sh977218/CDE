import { renderFile } from 'ejs';
import { is } from 'useragent';
import {version } from '../version';

/* for IE Opera Safari, emit polyfill.js */
function isModernBrowser(req) {
    const ua = is(req.headers['user-agent']);
    return ua.chrome || ua.firefox || ua.edge;
}

export function module() {
    const router = require('express').Router();

    let nativeRenderHtml = '';
    renderFile('modules/_nativeRenderApp/nativeRenderApp.ejs', {isLegacy: false, version}, (err, str) => {
        nativeRenderHtml = str;
    });

    let nativeRenderLegacyHtml = '';
    renderFile('modules/_nativeRenderApp/nativeRenderApp.ejs', {isLegacy: true, version}, (err, str) => {
        nativeRenderLegacyHtml = str;
    });
    router.get('/', (req, res) => {
        res.send(isModernBrowser(req) ? nativeRenderHtml : nativeRenderLegacyHtml);
    });

    return router;

}
