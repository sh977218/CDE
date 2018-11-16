let Parser = require('rss-parser');
let parser = new Parser();

const handleError = require('../log/dbLogger').handleError;
const db = require('./articleDb');


exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/:key', (req, res) => {
        db.byKey(req.params.key, handleError({res: res, origin: "/article/key"}, article => {
            if (!article) return res.status(404).send();
            res.send(article);
        }));
    });

    router.post('/:key', roleConfig.update, (req, res) => {
        if (req.body.key !== req.params.key) return res.status(400).send();
        db.update(req.body, handleError({res: res, origin: "POST /article/key"}, article => res.send(article)));
    });


    const RSS_FEED_URLs = [
        '',
        ''
    ];

    router.get('/rss/feeds', async (req, res) => {
        let RSS_FEEDs = [];
        for (let url of RSS_FEED_URLs) {
            let feed = await parser.parseURL(url);
            if (feed && feed.items)
                feed.items.forEach(item => {
                    RSS_FEEDs.push(item);
                });
        }
        let html = '';
        if (RSS_FEEDs) {
            let items = '';
            RSS_FEEDs.forEach(RSS_FEED => {
                let item = '<a href=' + RSS_FEED.link + ' target="_blank">' + RSS_FEED.title + '</a>';
                items += '<mat-list-item>' + item + '</mat-list-item>';
            });
            html += '<mat-list>' + items + '</mat-list>';
        }

        res.send(html);

    });

    return router;
};