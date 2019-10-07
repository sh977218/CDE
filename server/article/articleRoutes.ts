import { RequestHandler, Router } from 'express';
import * as Parser from 'rss-parser';
import { byKey, update } from 'server/article/articleDb';
import { Article } from 'shared/article/article.model';

const parser = new Parser();
require('express-async-errors');

export function module(roleConfig: { update: RequestHandler[] }) {
    const router = Router();

    ['whatsNew', 'contactUs', 'resources'].forEach(a => {
        router.get('/' + a, async (req, res) => {
            const article = await byKey(a);
            res.send(article);
        });
    });

    router.post('/:key', ...roleConfig.update, async (req, res) => {
        if (req.body.key !== req.params.key) {
            return res.status(400).send();
        }
        await update(req.body);

        const article = await byKey(req.params.key);
        res.send(article);
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

    router.get('/resourcesAndFeed', async (req, res) => {
        const articleDocument = await byKey('resources');
        if (!articleDocument) {
            res.send(404);
        } else {
            const article = articleDocument.toObject();
            await replaceRssToken(article);
            res.send(article);
        }
    });

    router.get('/videos', async (req, res) => {
        const articleDocument = await byKey('videos');
        if (!articleDocument) {
            res.send(404);
        } else {
            const article = articleDocument.toObject();
            res.send(article);
        }
    });

    return router;
}
