const schemas = require('./schemas');
const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const authorization = require('../system/authorization');
const exportShared = require('@std/esm')(module)('../../shared/system/exportShared');
const handleError = require('../log/dbLogger').handleError;
const mongo_data = require('../system/mongo-data');

const conn = connHelper.establishConnection(config.database.appData);
const User = conn.model('User', schemas.userSchema);
exports.user = User;

exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/', exportShared.nocacheMiddleware, (req, res) => {
        if (!req.user) return res.send({});
        User.findById(req.user._id, {password: 0}, handleError({res, origin: "/user/"}, user => res.send(user))
        );
    });

    router.post('/', (req, res) => {
        let update = {};
        if (req.body.email) update.email = req.body.email;
        if (req.body.searchSettings) update.searchSettings = req.body.searchSettings;
        if (req.body.publishedForms) update.email = req.body.publishedForms;
        User.update({_id: req.user._id}, {$set: update}, handleError({res, origin: "/user/"}, () => res.send('OK')));
    });

    router.get('/avatar/:username', (req, res) => {
        User.findOne({'username': new RegExp('^' + req.params.username + '$', "i")},
            {avatarUrl: 1}, handleError({res, origin: "/avatar/:username"}, () => res.send('OK')));
    });

    router.get('/mailStatus', [authorization.loggedInMiddleware], (req, res) => {
        mongo_data.mailStatus(req.user, handleError({res, origin: "/mailStatus"}, mails =>
            res.send({count: mails.length})));
    });

    router.get('/searchUsers/:username?', roleConfig.search, (req, res) => {
        User.find({'username': new RegExp(req.params.username, 'i')}, {password: 0}, handleError({res, origin: "/searchUsers"}, users =>
            res.send({users: users}))
        );
    });

    router.post('/addUser', roleConfig.manage, (req, res) => {
        User.findOne({username: req.body.username}, handleError({res, origin: "/addUser"}, existingUser => {
            if (existingUser) {
                res.send("Duplicated username");
                return;
            }
            new User({
                username: req.body.username.toLowerCase(),
                password: "umls",
                quota: 1024 * 1024 * 1024
            }).save(handleError({res, origin: "/addUser"}, newUser => res.send(newUser.username + " added.")));
        }));
    });
    return router;
};
