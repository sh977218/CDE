import { RequestHandler, Router } from 'express';
import { handleError, handleNotFound } from 'server/errorHandler';
import {
    appLogs, getClientErrors, getClientErrorsNumber, getServerErrors, getServerErrorsNumber, httpLogs, logClientError,
    usageByDay
} from 'server/log/dbLogger';
import { is, parse } from 'useragent';
import { userModel } from 'server/user/userDb';

export function module(roleConfig: { feedbackLog: RequestHandler, superLog: RequestHandler }) {
    const router = Router();

    router.post('/httpLogs', roleConfig.superLog, (req, res) => {
        httpLogs(req.body, handleError({req, res}, result => res.send(result)));
    });

    router.post('/appLogs', roleConfig.superLog, (req, res) => {
        appLogs(req.body, handleError({req, res}, result => res.send(result)));
    });

    router.get('/dailyUsageReportLogs', roleConfig.superLog, (req, res) => {
        usageByDay(handleError({req, res}, result => res.send(result)));
    });

    router.post('/serverErrors', roleConfig.superLog, (req, res) => {
        getServerErrors(req.body, handleError({req, res}, result => {
            res.send(result);
            userModel.findOneAndUpdate(
                {username: req.user.username},
                {$set: {'notificationDate.serverLogDate': new Date()}},
                {}).exec();
        }));
    });

    router.get('/serverErrorsNumber', roleConfig.superLog, async (req, res) => {
        getServerErrorsNumber(req.user, handleError({req, res}, result => res.send({count: result})));
    })
    router.get('/clientErrorsNumber', roleConfig.superLog, (req, res) => {
        getClientErrorsNumber(req.user, handleError({req, res}, result => res.send({count: result})));
    })

    router.post('/clientErrors', roleConfig.superLog, async (req, res) => {
        getClientErrors(req.body, handleNotFound({req, res}, result => {
            res.send(result.map(r => {
                const l: any = r.toObject();
                l.agent = parse(r.userAgent).toAgent();
                l.ua = is(r.userAgent);
                return l;
            }));
            userModel.findOneAndUpdate(
                {username: req.user.username},
                {$set: {'notificationDate.clientLogDate': new Date()}},
                {}).exec();
        }));
    });

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
