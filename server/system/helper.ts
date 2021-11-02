import { Request } from 'express';

/* for search engine and javascript disabled */
export function isSearchEngine(req: Request) {
    const userAgent = req.headers['user-agent'];
    return userAgent && userAgent.match(/bot|crawler|spider|crawling/gi);
}
