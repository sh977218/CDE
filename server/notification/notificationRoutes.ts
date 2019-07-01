import { handleError } from '../errorHandler/errHandler';
import { isSiteAdminMiddleware } from '../system/authorization';
import { getNumberClientError, getNumberServerError } from '../notification/notificationDb';

export function module() {
    const router = require('express').Router();

    router.get('/', isSiteAdminMiddleware, (req, res) => {
        getNumberServerError(req.user, handleError({req, res}, serverErrorCount => {
            getNumberClientError(req.user, handleError({req, res}, clientErrorCount =>
                res.send({serverErrorCount, clientErrorCount})));
        }));
    });

    return router;
}
