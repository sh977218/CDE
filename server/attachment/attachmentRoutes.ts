import * as Config from 'config';
import { RequestHandler, Router } from 'express';
import * as multer from 'multer';
import { add, approvalApprove, approvalDecline, remove, setDefault } from 'server/attachment/attachmentSvc';
import { Item, ModuleAll, User } from 'shared/models.model';

const config = Config as any;

export function module(roleConfig: { attachmentApproval: RequestHandler[] },
                       modules: { module: ModuleAll | 'article', db: any, crudPermission: (elt: Item, user?: User) => void }[]) {
    const router = Router();

    modules.forEach(m => {

        router.post(`/${m.module}/add`, multer(config.multer), (req, res) => {
            if (!req.files.uploadedFiles) {
                res.status(400).send('No files to attach.');
                return;
            } else {
                add(req, res, m.db, m.crudPermission);
            }
        });

        router.post(`/${m.module}/remove`, (req, res) => {
            remove(req, res, m.db, m.crudPermission);
        });

        router.post(`/${m.module}/setDefault`, (req, res) => {
            setDefault(req, res, m.db, m.crudPermission);
        });
    });

    router.post('/approve/:id', ...roleConfig.attachmentApproval, approvalApprove);
    router.post('/decline/:id', ...roleConfig.attachmentApproval, approvalDecline);

    return router;
}
