const async = require('async');
let Parser = require('rss-parser');
let parser = new Parser();

const handleError = require('../log/dbLogger').handleError;
const db = require('./articleDb');


exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/whatsNew', (req, res) => {
        db.byKey('whatsNew', handleError({res: res, origin: "GET /article/whatsNew"},
            article => {
                if (!article) return res.status(404).send();
                res.send(article);
            }));
    });

    router.post('/:key', roleConfig.update, (req, res) => {
        if (req.body.key !== req.params.key) return res.status(400).send();
        db.update(req.body, handleError({res: res, origin: "POST /article/whatsNew"},
            article => res.send(article)));
    });

    router.get('/resources', (req, res) => {
        db.byKey('resources', handleError({res: res, origin: "GET /article/resources"},
            article => {
                if (!article) return res.status(404).send();
                res.send(article);
            }));
    });
    router.get('/resourcesAndFeed', (req, res) => {
        db.byKey('resources', handleError({res: res, origin: "GET /article/resourcesAndFeed"},
            article => {
                if (!article) return res.status(404).send();
                let regex = /&lt;rss-feed&gt;.+&lt;\/rss-feed&gt;/gm;
                let matches = article.body.match(regex);
                async.forEachSeries(matches, (match, doneOneMatch) => {
                    let url = match.replace('&lt;rss-feed&gt;', '').replace('&lt;/rss-feed&gt;', '').trim();
                    parser.parseURL(url, handleError({req, res}, feed => {
                        let itemHtml = '';
                        if (feed && feed.items) {
                            feed.items.forEach(item => {
                                itemHtml += '<a href="' + item.link + '" target="_blank">' + item.title + '</a>';
                            });
                        }
                        article.body = article.body.replace(match, itemHtml);
                        doneOneMatch();
                    }))
                }, () => {
                    res.send(article);
                })

            }));
    });

    return router;
};