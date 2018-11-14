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
        'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1levKdK_NRDgDOegKHJEyYZlo0FVQP1DGnMNZF2yzL7RLoLM60',
        'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1xiH0Yth4GMcdkFE8LXzZAUVMEtKGBCLORz-NNsoeDUG-l1s1v',
        'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1xiH0Yth4GMcdkFE8LXzZAUVMEtKGBCLORz-NNsoeDUG-l1s1v'
    ];

    router.get('/rss/feeds', async (req, res) => {
        let RSS_FEED = [];
        for (let url of RSS_FEED_URLs) {
            try {
                let feed = await parser.parseURL(url);
                feed.items.forEach(item => {
                    RSS_FEED.push(item);
                });
            } catch (e) {
                return res.status(500).send();
            }
        }
        res.send(RSS_FEED);
    });

    return router;
};