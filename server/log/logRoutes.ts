import { Dictionary } from 'async';
import { Router } from 'express';
import { RequestHandler } from 'express';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import {
    appLogs, getClientErrors, getFeedbackIssues, getServerErrors, httpLogs, logClientError, saveFeedback, usageByDay
} from 'server/log/dbLogger';
import { pushGetAdministratorRegistrations } from 'server/notification/notificationDb';
import { triggerPushMsg } from 'server/notification/pushNotificationSvc';
import { is, parse } from 'useragent';

export function module(roleConfig: {feedbackLog: RequestHandler, superLog: RequestHandler}) {
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
        }));
    });

    router.post('/clientErrors', roleConfig.superLog, (req, res) => {
        getClientErrors(req.body, handleNotFound({req, res}, result => {
            res.send(result.map(r => {
                const l: any = r.toObject();
                l.agent = parse(r.userAgent).toAgent();
                l.ua = is(r.userAgent);
                return l;
            }));
        }));
    });

    router.post('/feedbackIssues', roleConfig.feedbackLog, (req, res) => {
        getFeedbackIssues(req.body, handleError({req, res}, result => res.send(result)));
    });

    router.post('/clientExceptionLogs', (req, res) => {
        logClientError(req, handleError({req, res}, result => res.send(result)));
    });

    router.get('/triggerServerErrorExpress', roleConfig.superLog, (req, res) => {
        res.send('received');
        // @ts-ignore
        trigger.error(); // jshint ignore:line
    });

    const feedbackIpTrack: Dictionary<number> = {};
    function canSubmitFeedback(ip: string) {
        if (!feedbackIpTrack[ip]) {
            feedbackIpTrack[ip] = Date.now();
            return true;
        } else {
            const v = feedbackIpTrack[ip];
            // wipe old date
            Object.keys(feedbackIpTrack).forEach(k => {
                if ((Date.now() - feedbackIpTrack[k]) > (1000 * 60)) {
                    feedbackIpTrack[k] = NaN;
                }
            });
            return (Date.now() - v) > (1000 * 60);
        }
    }

    router.post('/feedback/report', (req, res) => {
        if (!canSubmitFeedback(req.ip)) {
            return res.status(509).send();
        }
        if (req.body.feedback) {
            saveFeedback(req, () => {
                const msg = JSON.stringify({
                    title: 'New Feedback Message',
                    options: {
                        body: req.body.feedback ? req.body.feedback.description : '',
                        icon: '/cde/public/assets/img/min/NIH-CDE-FHIR.png',
                        badge: '/cde/public/assets/img/min/nih-cde-logo-simple.png',
                        tag: 'cde-feedback',
                        actions: [
                            {
                                action: 'audit-action',
                                title: 'View',
                                icon: '/cde/public/assets/img/min/nih-cde-logo-simple.png'
                            },
                            {
                                action: 'profile-action',
                                title: 'Edit Subscription',
                                icon: '/cde/public/assets/img/min/portrait.png'
                            }
                        ]
                    }
                });
                pushGetAdministratorRegistrations(registrations => {
                    registrations.forEach(r => triggerPushMsg(r, msg));
                });
                res.send({});
            });
        } else {
            res.status(400).send();
        }
    });

    return router;
}
