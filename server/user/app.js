const express = require('express');

const userSvc = require('./userService');

exports.init = function (app) {

    app.post('/user/me', function (req, res) {
        if (!req.user) return res.status(401).send();
        if (req.user._id.toString() !== req.body._id)
            return res.status(401).send();
        mongo_data.userById(req.user._id, function (err, user) {
            user.email = req.body.email;
            user.publishedForms = req.body.publishedForms;
            user.save(function (err) {
                if (err) return res.status(500).send("ERROR getting my user");
                res.send("OK");
            });
        });
    });
    app.post('/updateUserAvatar', function (req, res) {
        if (!authorizationShared.canOrgAuthority(req.user))
            return res.status(401).send("Not Authorized");
        userSvc.updateUserAvatar(req.body, function (err) {
            if (err) res.status(500).end();
            else res.status(200).end();
        });
    });

    app.get('/searchUsers/:username?', function (req, res) {
        if (!authorization.isSiteOrgAdmin(req))
            return res.status(401).send("Not Authorized");
        mongo_data.usersByPartialName(req.params.username, function (err, users) {
            res.send({users: users});
        });
    });

    app.get('/user/avatar/:username', function (req, res) {
        mongo_data.userByName(req.params.username, function (err, u) {
            res.send(u && u.avatarUrl ? u.avatarUrl : "");
        });
    });

    app.get('/mailStatus', function (req, res) {
        if (!req.user) return res.send({count: 0});
        mongo_data.mailStatus(req.user, function (err, results) {
            if (err) res.status(500).send("Unable to get mail status");
            else res.send({count: results.length});
        });
    });
    app.post('/user/update/searchSettings', function (req, res) {
        if (!req.user) return;
        userSvc.updateSearchSettings(req.user.username, req.body, function (err) {
            if (err) res.status(500).send("ERROR - cannot update search settings. ");
            else res.send("Search settings updated.");
        });
    });

};
