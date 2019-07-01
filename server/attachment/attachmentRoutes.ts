import * as Config from 'config';
import * as multer from 'multer';
import { add, approvalApprove, approvalDecline, remove, setDefault } from '../attachment/attachmentSvc';

const config = Config as any;

export function module(roleConfig, modules) {
    const router = require('express').Router();

    modules.forEach(m => {

        router.post(`/${m.module}/add`, multer(config.multer), (req, res) => {
            add(req, res, m.db, m.crudPermission);
        });

        router.post(`/${m.module}/remove`, (req, res) => {
            remove(req, res, m.db, m.crudPermission);
        });

        router.post(`/${m.module}/setDefault`, (req, res) => {
            setDefault(req, res, m.db, m.crudPermission);
        });
    });

    router.post('/approve/:id', roleConfig.attachmentApproval, approvalApprove);
    router.post('/decline/:id', roleConfig.attachmentApproval, approvalDecline);

    return router;
}
