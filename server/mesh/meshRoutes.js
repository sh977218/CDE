const handleError = require('../log/dbLogger').handleError;
const meshDb = require('./meshDb');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/eltId/:id', (req, res) => {
        meshDb.byEltId(req.params.id, handleError({req, res}, mm => res.send(mm.length ? mm[0] : '{}')));
    });
    return router;

};