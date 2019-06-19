import { forEachSeries } from 'async';
import * as Parser from 'rss-parser';
import { byKey, update } from '../../server/article/articleDb';
import { handleError } from '../../server/errorHandler/errHandler';

const parser = new Parser();

export function module(roleConfig) {
    const router = require('express').Router();

    ['whatsNew', "contactUs", "resources"].forEach(a => {
        router.get('/' + a, (req, res) => {
            byKey(a, handleError({res: res, origin: "GET /article/" + a},
                article => res.send(article)));
        });
    });

    router.post('/:key', roleConfig.update, (req, res) => {
        if (req.body.key !== req.params.key) return res.status(400).send();
        update(req.body, handleError({res: res, origin: "POST /article/:key"}, () => {
            byKey(req.params.key, (err, art) => res.send(art))
        }));


    });

    let rssFeeds = [];

    function replaceRssToken(article) {
        return new Promise((resolve, reject) => {
            let rssRegex = /&lt;rss-feed&gt;.+&lt;\/rss-feed&gt;/gm;
            let rssMatches = article.body.match(rssRegex);
            if (rssFeeds.length) {
                article.rssFeeds = rssFeeds;
            } else {
                article.rssFeeds = [];
            }

            let i = 0;
            forEachSeries(rssMatches, (match: string, doneOneMatch) => {
                let url = match.replace('&lt;rss-feed&gt;', '').replace('&lt;/rss-feed&gt;', '').trim();
                parser.parseURL(url, (err, feed) => {
                    if (err) reject(err);
                    else {
                        article.rssFeeds.push(feed);
                        rssFeeds.push(feed);
                        article.body = article.body.replace(match, '<div id="rssContent_' + i++ + '"></div>');
                        doneOneMatch();
                    }
                })
            }, err => {
                if (err) reject(err);
                else resolve();
            })
        })
    }

    router.get('/resourcesAndFeed', (req, res) => {
        byKey('resources', handleError({res: res, origin: "GET /article/resourcesAndFeed"},
            async article => {
                article = article.toObject();
                await replaceRssToken(article).catch(handleError({req, res}));
                res.send(article);
            }));
    });

    return router;
}
