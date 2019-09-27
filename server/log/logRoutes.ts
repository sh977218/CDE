import { handleError } from '../errorHandler/errorHandler';
import { triggerPushMsg } from 'server/notification/notificationSvc';
import { pushGetAdministratorRegistrations } from 'server/notification/notificationDb';

const userAgent = require('useragent');
const dbLogger = require('./dbLogger');

export function module(roleConfig) {
    const router = require('express').Router();

    router.post('/httpLogs', roleConfig.superLog, (req, res) => {
        dbLogger.httpLogs(req.body, handleError({req, res}, result => res.send(result)));
    });

    router.post('/appLogs', roleConfig.superLog, (req, res) => {
        dbLogger.appLogs(req.body, handleError({req, res}, result => res.send(result)));
    });

    router.get('/dailyUsageReportLogs', roleConfig.superLog, (req, res) => {
        dbLogger.usageByDay(handleError({req, res}, result => res.send(result)));
    });

    router.post('/serverErrors', roleConfig.superLog, (req, res) => {
        dbLogger.getServerErrors(req.body, handleError({req, res}, result => res.send(result)));
    });

    router.post('/clientErrors', roleConfig.superLog, (req, res) => {
        dbLogger.getClientErrors(req.body, handleError({req, res}, result => {
            res.send(result.map(r => {
                let l = r.toObject();
                l.agent = userAgent.parse(r.userAgent).toAgent();
                l.ua = userAgent.is(r.userAgent);
                return l;
            }));
        }));
    });

    router.post('/feedbackIssues', roleConfig.feedbackLog, (req, res) => {
        dbLogger.getFeedbackIssues(req.body, handleError({req, res}, result => res.send(result)));
    });

    router.post('/clientExceptionLogs', (req, res) => {
        dbLogger.logClientError(req, handleError({req, res}, result => res.send(result)));
    });

    router.get('/triggerServerErrorExpress', roleConfig.superLog, (req, res) => {
        res.send("received");
        // @ts-ignore
        trigger.error(); // jshint ignore:line
    });

    const feedbackIpTrack = {};
    let canSubmitFeedback = function (ip) {
        if (!feedbackIpTrack[ip]) {
            feedbackIpTrack[ip] = Date.now();
            return true;
        } else {
            let v = feedbackIpTrack[ip];
            // wipe old date
            Object.keys(feedbackIpTrack).forEach(k => {
                if ((Date.now() - feedbackIpTrack[k]) > (1000 * 60)) {
                    feedbackIpTrack[k] = undefined;
                }
            });
            return (Date.now() - v) > (1000 * 60);
        }
    };

    router.post('/feedback/report', (req, res) => {
        if (!canSubmitFeedback(req.ip)) return res.status(509).send();
        if (req.body.feedback) {
            dbLogger.saveFeedback(req, () => {
                let msg = JSON.stringify({
                    title: 'New Feedback Message',
                    options: {
                        body: req.body.feedback ? JSON.parse(req.body.feedback).note : '',
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
        } else res.status(400).send();
    });

    return router;
}
