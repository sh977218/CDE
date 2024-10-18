import { RequestHandler, Response, Router } from 'express';
import { respondError } from 'server/errorHandler';
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
    itemLogByModule,
} from 'server/log/dbLogger';
import { userModel } from 'server/user/userDb';
import { isSiteAdminMiddleware } from '../system/authorization';

export function module(roleConfig: { feedbackLog: RequestHandler; superLog: RequestHandler }) {
    const router = Router();

    router.post(
        '/httpLogs',
        roleConfig.superLog,
        (req, res): Promise<Response> => httpLogs(req.body).then(result => res.send(result), respondError({ req, res }))
    );

    router.post(
        '/appLogs',
        roleConfig.superLog,
        (req, res): Promise<Response> => appLogs(req.body).then(result => res.send(result), respondError({ req, res }))
    );

    router.get('/dailyUsageReportLogs/:numberOfDays', roleConfig.superLog, (req, res): Promise<Response> => {
        const numberOfDays = parseInt(req.params.numberOfDays, 10) || 3;
        return usageByDay(numberOfDays).then(result => res.send(result), respondError({ req, res }));
    });

    router.post('/itemLog/:module', roleConfig.feedbackLog, (req, res): Response | Promise<Response> => {
        if (!['de', 'form', 'classification'].includes(req.params.module)) {
            return res.status(400).send('Module needs to be "de", "form" or "classification".');
        }
        return itemLogByModule(req.params.module as unknown as 'de' | 'form' | 'classification', req.body).then(
            result => res.send(result),
            respondError({ req, res })
        );
    });

    router.post('/serverErrors', roleConfig.superLog, (req, res): Promise<Response> => {
        return serverErrors(req.body).then(result => {
            userModel
                .findOneAndUpdate(
                    { username: req.user.username },
                    { $set: { 'notificationDate.serverLogDate': new Date() } },
                    {}
                )
                .exec();
            return res.send(result);
        }, respondError({ req, res }));
    });

    router.post('/clientErrors', roleConfig.superLog, async (req, res) => {
        clientErrors(req.body).then(result => {
            userModel
                .findOneAndUpdate(
                    { username: req.user.username },
                    { $set: { 'notificationDate.clientLogDate': new Date() } },
                    {}
                )
                .exec();
            return res.send(result);
        }, respondError({ req, res }));
    });

    router.post('/loginRecords', isSiteAdminMiddleware, async (req, res) => {
        res.send(await loginRecord(req.body));
    });

    router.get('/serverErrorsNumber', roleConfig.superLog, async (req, res) => {
        getServerErrorsNumber(req.user).then(result => res.send({ count: result }), respondError({ req, res }));
    });
    router.get('/clientErrorsNumber', roleConfig.superLog, (req, res) => {
        getClientErrorsNumber(req.user).then(result => res.send({ count: result }), respondError({ req, res }));
    });

    router.post('/clientExceptionLogs', (req, res) => {
        logClientError(req, () => res.send());
    });

    router.get('/triggerServerErrorExpress', (req, res) => {
        res.send('received');
        // Run-time exception on purpose
        // @ts-ignore
        trigger.error(); // jshint ignore:line
    });

    return router;
}
