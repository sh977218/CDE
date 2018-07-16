const handleError = require('../log/dbLogger').handleError;
const notificationDb = require('./notificationDb');

exports.module = function (roleConfig) {
    const router = require('express').Router();
    router.get('/serverError', (req, res) => {
        notificationDb.getNumberServerError(req.user, handleError({req, res}, result => {
            res.send(result)
        }))
    });
    router.get('/clientError', (req, res) => {
        notificationDb.getNumberClientError(req.user, handleError({req, res}, result => {
            res.send(result)
        }))
    });

    return router;
};