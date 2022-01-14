import { Router } from 'express';
import { handleError } from 'server/errorHandler';
import { checkDatabase, create, remove, subscribe, updateStatus } from 'server/notification/pushNotificationSvc';
import { isSiteAdminMiddleware, loggedInMiddleware } from 'server/system/authorization';
import { RequestHandler } from 'express';

export function module(roleConfig: { notificationDate: RequestHandler }) {
    const router = Router();

    router.post('/updateNotificationDate', isSiteAdminMiddleware, roleConfig.notificationDate, (req, res) => {
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
    router.post('/pushRegistration', loggedInMiddleware, create);
    router.delete('/pushRegistration', loggedInMiddleware, remove);
    router.post('/pushRegistrationSubscribe', loggedInMiddleware, subscribe);
    router.post('/pushRegistrationUpdate', updateStatus);

    return router;
}
