const userAgent = require('useragent');

const dbLogger = require('./dbLogger');
const handleError = require('./dbLogger').handleError;
const mongo_data = require('../system/mongo-data');
const pushNotification = require('../system/pushNotification');

exports.module = function (roleConfig) {
    const router = require('express').Router();
    router.post('/httpLogs', (req, res) => {
        dbLogger.httpLogs(req.body, handleError({res:res, origin: "/httpLogs"}, result => res.send(result)));
    });

    router.post('/appLogs', (req, res) => {
        dbLogger.appLogs(req.body, handleError({res:res, origin: "/appLogs"}, result => res.send(result)));
    });

    router.get('/dailyUsageReportLogs', (req, res) => {
        dbLogger.usageByDay(handleError({res:res, origin: "/dailyUsageReportLogs"}, result => res.send(result)));
    });

    router.post('/serverErrors', (req, res) => {
        dbLogger.getServerErrors(req.body, handleError({res:res, origin: "/serverErrors"}, result => res.send(result)));
    });

    router.post('/clientErrors', (req, res) => {
        dbLogger.getClientErrors(req.body, handleError({res:res, origin: "/clientErrors"}, result => {
            res.send(result.map(r => {
                let l = r.toObject();
                l.agent = userAgent.parse(r.userAgent).toAgent();
                l.ua = userAgent.is(r.userAgent);
                return l;
            }));
        }));
    });


    router.post('/feedbackIssues', roleConfig.feedbackLog, (req, res) => {
        dbLogger.getFeedbackIssues(req.body, handleError({res:res, origin: "/feedbackIssues"}, result => res.send(result)));
    });

    router.post('/clientExceptionLogs', (req, res) => {
        dbLogger.logClientError(req, handleError({res:res, origin: "/clientExceptionLogs"}, result => res.send(result)));
    });

    router.get('/triggerServerErrorExpress', (req, res) => {
        res.send("received");
        mongo_data.saveNotification({
            title: 'trigger server error test',
            url: '/triggerServerErrorExpress',
            roles: ['siteAdmin']
        });
        trigger.error(); // jshint ignore:line
    });

    router.get('/triggerServerErrorMongoose', (req, res) => {
        res.send("received");
        mongo_data.orgByName("none");
        mongo_data.saveNotification({
            title: 'trigger server mongoose error test',
            url: '/triggerServerErrorMongoose',
            roles: ['siteAdmin']
        });
        trigger.error(); // jshint ignore:line

    });

    router.get('/triggerClientError', (req, res) => {
        res.send("received");
        mongo_data.saveNotification({
            title: 'trigger client error test',
            url: '/triggerClientError',
            roles: ['siteAdmin']
        });
        trigger.error();
    });

    router.post('/feedback/report', (req, res) => {
        mongo_data.saveNotification({
            title: 'Feedback Error: ' + req.body.feedback ? JSON.parse(req.body.feedback).note.substr(0, 15) : '',
            url: "/siteAudit#userFeedback",
            roles: ['siteAdmin']
        });

        dbLogger.saveFeedback(req, () => {
            let msg = {
                title: 'New Feedback Message\'',
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
            };

            mongo_data.pushGetAdministratorRegistrations(registrations => {
                registrations.forEach(r => pushNotification.triggerPushMsg(r, msg));
            });
            res.send({});
        });
    });
    return router;
};