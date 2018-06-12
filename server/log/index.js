const dbLogger = require('./dbLogger');
const mongo_data = require('../system/mongo-data');

exports.module = function (roleConfig) {
    const router = require('express').Router();
    router.post('/logs', (req, res) => {
        dbLogger.getLogs(req.body, dbLogger.handleGenericError(
            {res: res, origin: "/logs/"}, result => res.send(result))
        )
    });

    router.post('/appLogs', (req, res) => {
        dbLogger.appLogs(req.body, dbLogger.handleGenericError(
            {res: res, origin: "/appLogs"}, result => res.send(result))
        )
    });

    router.get('/logUsageDailyReport', (req, res) => {
        dbLogger.usageByDay(dbLogger.handleGenericError(
            {res: res, origin: "/logUsageDailyReport"}, result => res.send(result))
        )
    });

    router.post('/getServerErrors', (req, res) => {
        dbLogger.getServerErrors(req.body, dbLogger.handleGenericError(
            {res: res, origin: "/getServerErrors"}, result => res.send(result))
        )
    });

    router.post('/getClientErrors', (req, res) => {
        dbLogger.getClientErrors(req.body, dbLogger.handleGenericError(
            {res: res, origin: "/getClientErrors"}, result => {
                res.send(result.map(r => {
                    let l = r.toObject();
                    l.agent = useragent.parse(r.userAgent).toAgent();
                    l.ua = useragent.is(r.userAgent);
                    return l;
                }));
            })
        )
    });


    router.post('/getFeedbackIssues', roleConfig.feedbackLog, (req, res) => {
        dbLogger.getFeedbackIssues(req.body, dbLogger.handleGenericError(
            {res: res, origin: "/getFeedbackIssues/"}, result => res.send(result))
        )
    });

    router.post('/logClientException', (req, res) => {
        dbLogger.logClientError(req, dbLogger.handleGenericError(
            {res: res, origin: "/getFeedbackIssues/"}, result => res.send(result))
        )
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
            title: 'trigger server error test',
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