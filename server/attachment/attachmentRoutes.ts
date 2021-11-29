import * as Config from 'config';
import { Router } from 'express';
import * as multer from 'multer';
import { add, remove, setDefault } from 'server/attachment/attachmentSvc';
import { Attachable, AttachableDb } from 'shared/boundaryInterfaces/db/tags/attachableDb';
import { User } from 'shared/models.model';

const config = Config as any;

export function module<T extends Attachable>(db: AttachableDb<T>, crudPermission: (elt: T, user?: User) => boolean) {
    const router = Router();

    router.post(`/add`, multer({...config.multer, storage: multer.memoryStorage()}).any(), (req, res) =>
        add(req as any, res, db, crudPermission)
    );

    router.post(`/remove`, (req, res) =>
        remove(req, res, db, crudPermission)
    );

    router.post(`/setDefault`, (req, res) =>
        setDefault(req, res, db, crudPermission)
    );

    return router;
}
