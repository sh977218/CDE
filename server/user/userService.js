const router = require('express').Router();

const authorization = require('../system/authorization');
const mongo_user = require('./mongo_user');

router.post('/', [authorization.loggedInMiddleware], (req, res) => {
    mongo_data.userById(req.user._id, function (err, user) {
        user.email = req.body.email;
        user.publishedForms = req.body.publishedForms;
        user.save(err => {
            if (err) return res.status(500).send("ERROR getting my user");
            res.send("OK");
        });
    });
});
router.post('/updateUserAvatar', authorizationShared.isOrgAuthority, (req, res) => {
    userSvc.updateUserAvatar(req.body, err => {
        if (err) res.status(500).end();
        else res.status(200).end();
    });
});

router.get('/searchUsers/:username?', [authorization.isSiteOrgAdmin], (req, res) => {
    mongo_data.usersByPartialName(req.params.username, (err, users) => {
        res.send({users: users});
    });
});

router.get('/user/avatar/:username', (req, res) => {
    mongo_data.userByName(req.params.username, (err, u) => {
        res.send(u && u.avatarUrl ? u.avatarUrl : "");
    });
});

router.get('/mailStatus', [authorization.loggedInMiddleware], (req, res) => {
    mongo_data.mailStatus(req.user, (err, results) => {
        if (err) res.status(500).send("Unable to get mail status");
        else res.send({count: results.length});
    });
});
app.post('/user/update/searchSettings', [authorization.loggedInMiddleware], (req, res) => {
    userSvc.updateSearchSettings(req.user.username, req.body, err => {
        if (err) res.status(500).send("ERROR - cannot update search settings. ");
        else res.send("Search settings updated.");
    });
});

exports.module = router;