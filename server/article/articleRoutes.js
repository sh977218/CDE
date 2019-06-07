const async = require('async');
let Parser = require('rss-parser');
let parser = new Parser();

const handleError = require('../errorHandler/errHandler').handleError;
const db = require('./articleDb');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    ['whatsNew', "contactUs", "resources"].forEach(a => {
        router.get('/' + a, (req, res) => {
            db.byKey(a, handleError({res: res, origin: "GET /article/" + a},
                article => res.send(article)));
        });
    });

    router.post('/:key', roleConfig.update, (req, res) => {
        if (req.body.key !== req.params.key) return res.status(400).send();
        db.update(req.body, handleError({res: res, origin: "POST /article/:key"}, () => {
            db.byKey(req.params.key, (err, art) => res.send(art))
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
            async.forEachSeries(rssMatches, (match, doneOneMatch) => {
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
        db.byKey('resources', handleError({res: res, origin: "GET /article/resourcesAndFeed"},
            async article => {
                article = article.toObject();
                await replaceRssToken(article).catch(handleError({req, res}));
                res.send(article);
            }));
    });

    return router;
};