import { Router } from 'express';
import { handleError } from 'server/errorHandler/errorHandler';
import { checkDatabase, create, remove, subscribe, updateStatus } from 'server/notification/pushNotificationSvc';
import { loggedInMiddleware } from 'server/system/authorization';
import { RequestHandler } from 'express';

export function module(roleConfig: { notificationDate: RequestHandler }) {
    const router = Router();

    router.post('/updateNotificationDate', roleConfig.notificationDate, (req, res) => {
        const notificationDate = req.body;
        let changed = false;
        if (notificationDate.clientLogDate) {
            req.user.notificationDate.clientLogDate = notificationDate.clientLogDate;
            changed = true;
        }
        if (notificationDate.serverLogDate) {
            req.user.notificationDate.serverLogDate = notificationDate.serverLogDate;
            changed = true;
        }
        if (changed) {
            req.user.save(handleError({req, res}, () => res.send()));
        }
    });


    checkDatabase();
    router.post('/', loggedInMiddleware, create);
    router.delete('/', loggedInMiddleware, remove);
    router.post('/', loggedInMiddleware, subscribe);
    router.post('/', updateStatus);

    return router;
}
