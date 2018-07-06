const handleError = require('../log/dbLogger').handleError;
const db = require('./articleDb');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/:key', (req, res) => {
        db.byKey(req.params.key, handleError({res: res, origin: "/article/key"}, article => {
            res.send(article);
        }));
    });

    router.post('/:key', roleConfig.update, (req, res) => {
        if (req.body.key !== req.params.key) return res.status(400).send();
        db.update(req.body, handleError({res: res, origin: "POST /article/key"}, article => {
            res.send(article);
        }))
    });

    return router;
};