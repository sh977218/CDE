const handleError = require('../log/dbLogger').handleError;
const notificationDb = require('./notificationDb');
const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/', roleConfig.errorLog, (req, res) => {
        if (!req.user || !authorizationShared.isSiteAdmin(req.user)) {
            return res.send({serverErrorCount: 0, clientErrorCount: 0});
        }
        notificationDb.getNumberServerError(req.user, handleError({req, res}, serverErrorCount => {
            notificationDb.getNumberClientError(req.user, handleError({req, res}, clientErrorCount =>
                res.send({serverErrorCount, clientErrorCount})))
        }))
    });

    return router;
};