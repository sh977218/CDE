import { config } from '../system/parseConfig';

export const GLOBALS = {
    logdir : config.logdir || __dirname,
    REQ_TIMEOUT : 2000,
};

/* for search engine and javascript disabled */
export function isSearchEngine(req) {
    const userAgent = req.headers['user-agent'];
    return userAgent && userAgent.match(/bot|crawler|spider|crawling/gi);
}
