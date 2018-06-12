const router = require('express').Router();

const schemas = require('./schemas');
const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);
const User = conn.model('User', schemas.userSchema);

const authorization = require('../system/authorization');
const exportShared = require('@std/esm')(module)('../../shared/system/exportShared');
const dbLogger = require('../log/dbLogger');
const mongo_data = require('../system/mongo-data');

router.get('/', exportShared.nocacheMiddleware, (req, res) => {
    if (!req.user) return res.send({});
    User.findById(req.user._id, {password: 0}, dbLogger.handleGenericError(
        {res: res, origin: "/user/"}, user => res.send(user))
    )
});

router.post('/', (req, res) => {
    let update = {};
    if (req.body.email) update.email = req.body.email;
    if (req.body.searchSettings) update.searchSettings = req.body.searchSettings;
    if (req.body.publishedForms) update.email = req.body.publishedForms;
    User.update({_id: req.user._id}, update, dbLogger.handleGenericError(
        {res: res, origin: "/user/"}, () => res.send('OK'))
    )
});

router.get('/avatar/:username', (req, res) => {
    User.findOne({'username': new RegExp('^' + req.params.username + '$', "i")},
        {avatarUrl: 1}, dbLogger.handleGenericError(
            {res: res, origin: "/avatar/:username"}, () => res.send('OK')))
});

router.get('/mailStatus', [authorization.loggedInMiddleware], (req, res) => {
    mongo_data.mailStatus(req.user, dbLogger.handleGenericError(
        {res: res, origin: "/mailStatus"}, mails => res.send({count: mails.length}))
    )
});

router.get('/searchUsers/:username?', [authorization.isSiteOrgAdmin], (req, res) => {
    User.find({'username': new RegExp(req.params.username, 'i')}, {password: 0}, dbLogger.handleGenericError(
        {res: res, origin: "/searchUsers"}, users => res.send({users: users}))
    )
});

exports.module = router;