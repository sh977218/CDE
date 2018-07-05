const handleError = require('../log/dbLogger').handleError;
const db = require('./db');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/:key', (req, res) => {
        db.byKey(req.params.key, handleError({res: res, origin: "/article/key"}, article => {
            res.send(article);
        }));
    });

    router.post('/:key', roleConfig.update, (req, res) => {

    };

    return router;
};