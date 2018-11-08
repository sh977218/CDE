const config = require('config');
const multer = require('multer');
const attachment = require('./attachmentSvc');

exports.module = function (roleConfig, modules) {
    const router = require('express').Router();

    modules.forEach(m => {
        router.post(`/${m.module}/add`, multer(config.multer), (req, res) => {
            attachment.add(req, res, m.db);
        });

        router.post(`/${m.module}/remove`, (req, res) => {
            attachment.remove(req, res, m.db);
        });

        router.post(`/${m.module}/setDefault`, (req, res) => {
            attachment.setDefault(req, res, m.db);
        });
    });

    router.post('/approve/:id', attachment.approvalApprove);
    router.post('/decline/:id', attachment.approvalDecline);

    return router;
};
