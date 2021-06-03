import * as Config from 'config';
import { Router } from 'express';
import * as multer from 'multer';
import { add, remove, setDefault } from 'server/attachment/attachmentSvc';
import { Item, ModuleAll, User } from 'shared/models.model';

const config = Config as any;

export function module(modules: {module: ModuleAll | 'article', db: any, crudPermission: (elt: Item, user?: User) => boolean}[]) {
    const router = Router();

    modules.forEach(m => {

        router.post(`/${m.module}/add`, multer(config.multer).any(), (req, res) => {
            add(req as any, res, m.db, m.crudPermission);
        });

        router.post(`/${m.module}/remove`, (req, res) => {
            remove(req, res, m.db, m.crudPermission);
        });

        router.post(`/${m.module}/setDefault`, (req, res) => {
            setDefault(req, res, m.db, m.crudPermission);
        });
    });

    return router;
}
