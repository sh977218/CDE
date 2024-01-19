import {RequestHandler, Router} from 'express';
import {handleError, handleNotFound} from 'server/errorHandler';
import {
    appLogs,
    clientErrors,
    getClientErrorsNumber,
    getServerErrorsNumber,
    httpLogs,
    logClientError,
    loginRecord,
    serverErrors,
    usageByDay,
} from 'server/log/dbLogger';
import {userModel} from 'server/user/userDb';
import {isSiteAdminMiddleware} from "../system/authorization";

export function module(roleConfig: { feedbackLog: RequestHandler, superLog: RequestHandler }) {
    const router = Router();

    router.post('/httpLogs', roleConfig.superLog, (req, res) => {
        httpLogs(req.body, handleError({req, res}, result => res.send(result)));
    });

    router.post('/appLogs', roleConfig.superLog, (req, res) => {
        appLogs(req.body, handleError({req, res}, result => res.send(result)));
    });

    router.get('/dailyUsageReportLogs/:numberOfDays', roleConfig.superLog, (req, res) => {
        const numberOfDays = parseInt(req.params.numberOfDays) || 3;
        usageByDay(numberOfDays, handleError({req, res}, result => res.send(result)));
    });

    router.post('/serverErrors', roleConfig.superLog, (req, res) => {
        serverErrors(req.body, handleError({req, res}, result => {
            res.send(result);
            userModel.findOneAndUpdate(
                {username: req.user.username},
                {$set: {'notificationDate.serverLogDate': new Date()}},
                {}).exec();
        }));
    });

    router.post('/clientErrors', roleConfig.superLog, async (req, res) => {
        clientErrors(req.body, handleNotFound({req, res}, result => {
            res.send(result);
            userModel.findOneAndUpdate(
                {username: req.user.username},
                {$set: {'notificationDate.clientLogDate': new Date()}},
                {}).exec();
        }));
    });

    router.post('/loginRecords', isSiteAdminMiddleware, async (req, res) => {
        res.send(await loginRecord(req.body));
    });

    router.get('/serverErrorsNumber', roleConfig.superLog, async (req, res) => {
        getServerErrorsNumber(req.user, handleError({req, res}, result => res.send({count: result})));
    })
    router.get('/clientErrorsNumber', roleConfig.superLog, (req, res) => {
        getClientErrorsNumber(req.user, handleError({req, res}, result => res.send({count: result})));
    })

    router.post('/clientExceptionLogs', (req, res) => {
        logClientError(req, () => res.send());
    });

    router.get('/triggerServerErrorExpress', roleConfig.superLog, (req, res) => {
        res.send('received');
        // Run-time exception on purpose
        // @ts-ignore
        trigger.error(); // jshint ignore:line
    });

    return router;
}
