import { Request } from 'express';
import { config } from 'server/system/parseConfig';

export const GLOBALS = {
    logdir : config.logdir || __dirname,
    REQ_TIMEOUT : 2000,
};

/* for search engine and javascript disabled */
export function isSearchEngine(req: Request) {
    const userAgent = req.headers['user-agent'];
    return userAgent && userAgent.match(/bot|crawler|spider|crawling/gi);
}
