const config = require('config');
const multer = require('multer');
const attachment = require('./attachmentSvc');

exports.module = function (roleConfig, modules) {
    const router = require('express').Router();

    modules.forEach(m => {

        router.post(`/${m.module}/add`, multer(config.multer), (req, res) => {
            attachment.add(req, res, m.db, m.crudPermission);
        });

        router.post(`/${m.module}/remove`, (req, res) => {
            attachment.remove(req, res, m.crudPermission);
        });

        router.post(`/${m.module}/setDefault`, (req, res) => {
            attachment.setDefault(req, res, m.crudPermission);
        });
    });

    router.post('/approve/:id', roleConfig.attachmentApproval, attachment.approvalApprove);
    router.post('/decline/:id', roleConfig.attachmentApproval, attachment.approvalDecline);

    return router;
};
