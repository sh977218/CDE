const authorization = require('../system/authorization');
const nocacheMiddleware = authorization.nocacheMiddleware;
const loggedInMiddleware = authorization.loggedInMiddleware;
const dbLogger = require('../log/dbLogger');
const handle404 = dbLogger.handle404;
const handleError = dbLogger.handleError;
const respondError = dbLogger.respondError;
const mongo_data = require('../system/mongo-data');
const userDb = require('./userDb');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/', [nocacheMiddleware], (req, res) => {
        if (!req.user) return res.send({});
        userDb.byId(req.user._id, handle404({req, res}, user => {
            res.send(user);
        }));
    });

    router.post('/', (req, res) => {
        userDb.updateUser(req.user, req.body, handle404({req, res}, () => {
            res.send();
        }));
    });

    router.get('/avatar/:username', (req, res) => {
        userDb.avatarByUsername(req.params.username, handle404({req, res}, avatar => {
            res.send(avatar);
        }));
    });

    router.get('/mailStatus', [loggedInMiddleware], (req, res) => {
        mongo_data.mailStatus(req.user, handle404({req, res}, mails => {
            res.send({count: mails.length});
        }));
    });

    router.get('/searchUsers/:username?', roleConfig.search, (req, res) => {
        userDb.usersByUsername(req.params.username, handle404({req, res}, users => {
            res.send(users);
        }));
    });

    router.get('/tasks', [nocacheMiddleware, loggedInMiddleware], (req, res) => {
        userDb.byId(req.user._id, handleError({req, res}, user => {
            if (!user) {
                respondError('User got deleted XP', {req, res});
                return;
            }
            res.send(user.tasks);
        }));
    });

    router.delete('/tasks', [loggedInMiddleware], (req, res) => {
        userDb.byId(req.user._id, handle404({req, res}, user => {
            let updatedTasks = user.tasks.filter(t => req.query.ids.indexOf(t.id) === -1);
            if (user.tasks.length === updatedTasks.length) {
                res.send({tasks: user.tasks});
                return;
            }
            userDb.updateUser(user, {tasks: updatedTasks}, handleError({req, res}, () => {
                userDb.byId(req.user._id, handle404({req, res}, savedUser => {
                    res.send({tasks: savedUser.tasks});
                }));
            }));
        }));
    });

    router.post('/addUser', roleConfig.manage, (req, res) => {
        let username = req.body.username;
        userDb.byUsername(username, handleError({req, res}, existingUser => {
            if (existingUser) return res.status(409).send("Duplicated username");
            let newUser = {
                username: username.toLowerCase(),
                password: "umls",
                quota: 1024 * 1024 * 1024
            };
            userDb.save(newUser, handleError({req, res}, () => res.send(username + " added.")));
        }));
    });

    router.post('/updateNotificationDate', roleConfig.notificationDate, (req, res) => {
        let notificationDate = req.body;
        userDb.byId(req.user._id, handle404({req, res}, user => {
            if (user) {
                if (notificationDate.clientLogDate) user.notificationDate.clientLogDate = notificationDate.clientLogDate;
                if (notificationDate.serverLogDate) user.notificationDate.serverLogDate = notificationDate.serverLogDate;
            }
            user.save(handleError({req, res}, () => res.send()));
        }));
    });
    return router;
};
