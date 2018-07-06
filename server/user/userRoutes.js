const authorization = require('../system/authorization');
const exportShared = require('@std/esm')(module)('../../shared/system/exportShared');
const handleError = require('../log/dbLogger').handleError;
const mongo_data = require('../system/mongo-data');
const userDb = require('./userDb');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/', [exportShared.nocacheMiddleware], (req, res) => {
        if (!req.user) return res.send({});
        userDb.byId(req.user._id, handleError({
            res: res,
            origin: "/user"
        }, user => {
            if (!user) return res.status(404).send();
            res.send(user);
        }))
    });

    router.post('/', (req, res) => {
        userDb.updateUser(req.user._id, req.body, handleError({
            res: res,
            origin: "/user"
        }, user => {
            if (!user) return res.status(404).send();
            res.send(user);
        }))
    });

    router.get('/avatar/:username', (req, res) => {
        userDb.avatarByUsername(req.params.username, handleError({
            res: res,
            origin: "/avatar/:username"
        }, avatar => {
            if (!avatar) return res.status(404).send();
            res.send(avatar);
        }))
    });

    router.get('/mailStatus', [authorization.loggedInMiddleware], (req, res) => {
        mongo_data.mailStatus(req.user, handleError({
            res: res,
            origin: "/mailStatus"
        }, mails => res.send({count: mails.length})));
    });

    router.get('/searchUsers/:username?', roleConfig.search, (req, res) => {
        userDb.usersByUsername(req.params.username, handleError({
                res: res,
                origin: "/searchUsers"
            }, users => {
                if (!users) return res.status(404).send();
                res.send({users: users})
            })
        )
    });

    router.post('/addUser', roleConfig.manage, (req, res) => {
        userDb.byUsername(req.body.username, handleError({
            res: res,
            origin: "/addUser"
        }, existingUser => {
            if (existingUser) return res.status(409).send("Duplicated username");
            let newUser = {
                username: req.body.username.toLowerCase(),
                password: "umls",
                quota: 1024 * 1024 * 1024
            };
            userDb.save(newUser, handleError({
                res: res,
                origin: "/addUser"
            }, savedUser => res.send(savedUser.username + " added.")));
        }))
    });
    return router;
};
