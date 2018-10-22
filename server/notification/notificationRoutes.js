const handleError = require('../log/dbLogger').handleError;
const notificationDb = require('./notificationDb');
const authorization = require('../system/authorization');

exports.module = function () {
    const router = require('express').Router();

    router.get('/', authorization.isSiteAdminMiddleware, (req, res) => {
        notificationDb.getNumberServerError(req.user, handleError({req, res}, serverErrorCount => {
            notificationDb.getNumberClientError(req.user, handleError({req, res}, clientErrorCount =>
                res.send({serverErrorCount, clientErrorCount})));
        }));
    });

    return router;
};