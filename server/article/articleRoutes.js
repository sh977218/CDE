const async = require('async');
let Parser = require('rss-parser');
let parser = new Parser();

const handleError = require('../log/dbLogger').handleError;
const db = require('./articleDb');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    ['whatsNew', "contactUs", "resources"].forEach(a => {
        router.get('/' + a, (req, res) => {
            db.byKey(a, handleError({res: res, origin: "GET /article/" + a},
                article => {
                    if (!article) res.send("");
                    else res.send(article);
                }));
        });
    });

    router.post('/:key', roleConfig.update, (req, res) => {
        if (req.body.key !== req.params.key) return res.status(400).send();
        db.update(req.body, handleError({res: res, origin: "POST /article/:key"}, () => {
            db.byKey(req.params.key, (err, art) => res.send(art))
        }));


    });

    let rssFeeds = [];

    router.get('/resourcesAndFeed', (req, res) => {
        db.byKey('resources', handleError({res: res, origin: "GET /article/resourcesAndFeed"},
            article => {
                article = article.toObject();
                if (!article) return res.status(404).send();
                let regex = /&lt;rss-feed&gt;.+&lt;\/rss-feed&gt;/gm;
                let matches = article.body.match(regex);
                if (rssFeeds.length) {
                    article.rssFeeds = rssFeeds;
                    res.send(article);
                } else {
                    article.rssFeeds = [];
                    let i = 0;
                    async.forEachSeries(matches, (match, doneOneMatch) => {
                        let url = match.replace('&lt;rss-feed&gt;', '').replace('&lt;/rss-feed&gt;', '').trim();
                        if (!url) {
                            doneOneMatch();
                            return;
                        }
                        parser.parseURL(url, handleError({req, res}, feed => {
                            article.rssFeeds.push(feed);
                            article.body = article.body.replace(match, '<div id="rssContent_' + i++ + '"></div>');
                            rssFeeds = article.rssFeeds;
                            doneOneMatch();
                        }))
                    }, () => {
                        res.send(article);
                        setTimeout(() => rssFeeds = [], 1 * 60 * 1000);
                    })
                }
            }));
    });

    return router;
};