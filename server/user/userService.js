const router = require('express').Router();

const authorization = require('../system/authorization');
const mongo_user = require('./mongo_user');
const mongo_data = require('../system/mongo-data');

router.post('/', [authorization.loggedInMiddleware], (req, res) => {
    let user = req.user;
    let condition = {_id: user._id};
    let update = {};
    if (req.body.email) update.email = req.body.email;
    if (req.body.publishedForms) update.email = req.body.publishedForms;
    mongo_user.User.update(condition, update, dbLogger.handleGenericError(
        {res: res, origin: "/user/"}, () => res.send('OK'))
    )
});
router.put('/avatar', authorizationShared.isOrgAuthority, (req, res) => {
    let user = req.body;
    let condition = {_id: user._id};
    let update = {};
    if (user.avatarUrl) update.avatarUrl = user.avatarUrl;
    mongo_user.User.update(condition, update, dbLogger.handleGenericError(
        {res: res, origin: "/user/avatar"}, () => res.send('OK'))
    )
});

router.get('/avatar/:username', (req, res) => {
    let username = req.params.username;
    let condition = {'username': new RegExp('^' + username + '$', "i")};
    let project = {avatarUrl: 1};
    mongo_user.User.findOne(condition, project, dbLogger.handleGenericError(
        {res: res, origin: "/user/avatar/:username"}, () => res.send('OK'))
    )
});

router.get('/:username?', [authorization.isSiteOrgAdmin], (req, res) => {
    let condition = {'username': new RegExp(name, 'i')};
    let project = {password: 0};
    mongo_user.User.find(condition, project, dbLogger.handleGenericError(
        {res: res, origin: "/user/:username"}, users => res.send(users))
    )
});

router.get('/mailStatus', [authorization.loggedInMiddleware], (req, res) => {
    mongo_data.mailStatus(req.user, dbLogger.handleGenericError(
        {res: res, origin: "/user/mailStatus"}, mails => res.send({count: mails.length}))
    )
});
app.put('/searchSettings', [authorization.loggedInMiddleware], (req, res) => {
    let user = req.user;
    let condition = {_id: user._id};
    let update = {};
    if (user.searchSettings) update.searchSettings = user.searchSettings;
    mongo_user.User.update(condition, update, dbLogger.handleGenericError(
        {res: res, origin: "/user/searchSettings"}, () => res.send("Search settings updated."))
    )
});

exports.module = router;