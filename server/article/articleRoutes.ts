import { Router } from 'express';
import { RequestHandler } from 'express';
import * as Parser from 'rss-parser';
import { byKey, update } from 'server/article/articleDb';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import { Article } from 'shared/article/article.model';

const parser = new Parser();

export function module(roleConfig: {update: RequestHandler[]}) {
    const router = Router();

    ['whatsNew', 'contactUs', 'resources'].forEach(a => {
        router.get('/' + a, (req, res) => {
            byKey(a, handleError({req, res},
                article => res.send(article)));
        });
    });

    router.post('/:key', ...roleConfig.update, (req, res) => {
        if (req.body.key !== req.params.key) {
            return res.status(400).send();
        }
        update(req.body, handleError({req, res}, () => {
            byKey(req.params.key, (err, art) => res.send(art));
        }));
    });

    const rssFeeds: string[] = [];

    async function replaceRssToken(article: Article) {
        const rssRegex = /&lt;rss-feed&gt;.+&lt;\/rss-feed&gt;/gm;
        const rssMatches = article.body.match(rssRegex);
        if (rssFeeds.length) {
            article.rssFeeds = rssFeeds;
        } else {
            article.rssFeeds = [];
        }

        if (rssMatches) {
            for (let i = 0; i < rssMatches.length; i++) {
                const match = rssMatches[i];
                const url = match.replace('&lt;rss-feed&gt;', '').replace('&lt;/rss-feed&gt;', '').trim();

                const feed: any = await parser.parseURL(url);
                article.rssFeeds.push(feed);
                rssFeeds.push(feed);
                article.body = article.body.replace(match, '<div id="rssContent_' + i + '"></div>');
            }
        }
    }

    router.get('/resourcesAndFeed', (req, res) => {
        byKey('resources', handleNotFound({req, res}, async articleDocument => {
            const article = articleDocument.toObject();
            await replaceRssToken(article).catch(handleError({req, res}));
            res.send(article);
        }));
    });

    return router;
}
