import { handleError } from '../../server/errorHandler/errHandler';
import { isSiteAdminMiddleware } from '../../server/system/authorization';
import { getNumberClientError, getNumberServerError } from '../../server/notification/notificationDb';

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
