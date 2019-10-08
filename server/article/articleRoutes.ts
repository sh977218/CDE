import { RequestHandler, Router } from 'express';
import * as Parser from 'rss-parser';
import { byKey, update } from 'server/article/articleDb';
import { Article } from 'shared/article/article.model';

const parser = new Parser();
require('express-async-errors');

export function module(roleConfig: { update: RequestHandler[] }) {
    const router = Router();

    ['whatsNew', 'contactUs', 'resources', 'videos'].forEach(a => {
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
            res.status(404).send();
        } else {
            const article = articleDocument.toObject();
            await replaceRssToken(article);
            res.send(article);
        }
    });

    async function replaceVideoToken(article: Article) {
        const tokenRegex = /&lt;cde-youtube-video&gt;.+&lt;\/cde-youtube-video&gt;/gm;
        const tokenMatches = article.body.match(tokenRegex);
        if (tokenMatches) {
            for (const match of tokenMatches) {
                const url = match.replace('&lt;cde-youtube-video&gt;', '').replace('&lt;/cde-youtube-video&gt;', '').trim();
                // tslint:disable-next-line:max-line-length
                const iframe = `<iframe width="560" height="315" src="${url}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                article.body = article.body.replace(match, iframe);
            }
        }
    }

    router.get('/videosAndIframe', async (req, res) => {
        const articleDocument = await byKey('videos');
        if (!articleDocument) {
            res.status(404).send();
        } else {
            const article = articleDocument.toObject();
            await replaceVideoToken(article);
            res.send(article);
        }
    });

    return router;
}
