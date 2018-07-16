const handleError = require('./dbLogger').handleError;
const notificationDb = require('./notificationDb');

exports.module = function (roleConfig) {
    const router = require('express').Router();
    router.get('/serverError', (req, res) => {
        notificationDb.getNumberServerError(req.user, handleError({req, res}, () => {
        }))
    });
    router.get('/clientError', (req, res) => {
    });

    return router;
};