const authorization = require('../system/authorization');
const exportShared = require('@std/esm')(module)('../../shared/system/exportShared');
const handleError = require('../log/dbLogger').handleError;
const mongo_data = require('../system/mongo-data');
const userDb = require('./userDb');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/', [exportShared.nocacheMiddleware], (req, res) => {
        if (!req.user) return res.send({});
        userDb.byId(req.user._id, handleError({req, res}, user => {
            if (!user) return res.status(404).send();
            res.send(user);
        }))
    });

    router.post('/', (req, res) => {
        userDb.updateUser(req.user._id, req.body, handleError({req, res}, user => {
            if (!user) return res.status(404).send();
            res.send(user);
        }))
    });

    router.get('/avatar/:username', (req, res) => {
        userDb.avatarByUsername(req.params.username, handleError({req, res}, avatar => {
            if (!avatar) return res.status(404).send();
            res.send(avatar);
        }))
    });

    router.get('/mailStatus', [authorization.loggedInMiddleware], (req, res) => {
        mongo_data.mailStatus(req.user, handleError({req, res}, mails => {
            if (!mails) return res.status(404).send();
            res.send({count: mails.length})
        }));
    });

    router.get('/searchUsers/:username?', roleConfig.search, (req, res) => {
        userDb.usersByUsername(req.params.username, handleError({req, res}, users => {
                if (!users) return res.status(404).send();
                res.send({users: users})
            })
        )
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
        }))
    });
    return router;
};