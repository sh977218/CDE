const handleError = require('../log/dbLogger').handleError;
const notificationDb = require('./notificationDb');
const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/', (req, res) => {
        if (!req.user || !authorizationShared.isSiteAdmin(req.user))
            return res.send({serverErrorCount: 0, clientErrorCount: 0});
        notificationDb.getNumberServerError(req.user, handleError({req, res}, serverErrorCount => {
            notificationDb.getNumberClientError(req.user, handleError({req, res}, clientErrorCount =>
                res.send({serverErrorCount, clientErrorCount})))
        }))


    });
    router.get('/serverError', (req, res) => {
        notificationDb.getNumberServerError(req.user, handleError({req, res}, result => res.send({count: result})))
    });
    router.get('/clientError', (req, res) => {
        notificationDb.getNumberClientError(req.user, handleError({req, res}, result => res.send({count: result})))
    });

    return router;
};