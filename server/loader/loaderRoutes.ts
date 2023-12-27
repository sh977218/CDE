import { Response, Router } from 'express';
import { config } from 'server';
import {
    addValidationWhitelist,
    deleteValidationWhitelist,
    getValidationWhitelists,
    runValidationOnLoadCSV,
    spellcheckCSVLoad,
    updateValidationWhitelist
} from 'server/loader/validators';

import * as multer from 'multer';
import { processWorkBook } from 'server/submission/submissionSvc';
import { read as readXlsx } from 'xlsx';

export function module() {
    const router = Router();

    router.post('/validateCSVLoad', multer({
        ...config.multer,
        storage: multer.memoryStorage()
    }).any(), async (req, res) => {
        if (!req.files) {
            res.status(400).send('No file uploaded for validation');
            return;
        }
        const fileBuffer = (req.files as any)[0].buffer;
        const reportOutput = await runValidationOnLoadCSV(fileBuffer);
        res.send(reportOutput);
    });

    router.post('/validateSubmissionWorkbookLoad', multer({
        ...config.multer,
        storage: multer.memoryStorage()
    }).any(), async (req, res) => {
        if (!req.files) {
            res.status(400).send('No file uploaded for validation');
            return;
        }
        const fileBuffer = (req.files as any)[0].buffer;
        const reportOutput = await processWorkBook({} as any, readXlsx(fileBuffer));
        res.send(reportOutput);
    });

    router.post('/spellcheckCSVLoad', multer({...config.multer, storage: multer.memoryStorage()}).any(),
        async (req, res): Promise<Response> => {
            if (!req.files) {
                return res.status(400).send('No file uploaded for spell check');
            }
            if (!req.body.whitelist) {
                return res.status(400).send('No whitelist specified');
            }
            const fileBuffer = (req.files as any)[0].buffer;
            const reportOutput = await spellcheckCSVLoad(req.body.whitelist, fileBuffer);
            return res.send(reportOutput);
        }
    );

    router.get('/whitelists', async (req, res) => res.send(await getValidationWhitelists()));

    router.post('/addNewWhitelist', async (req, res) => {
        if (!req.body.collectionName) {
            return res.status(400).send('No name for new whitelist provided');
        }
        await addValidationWhitelist(req.body);
        return res.status(200).send('Whitelist created');
    });

    router.post('/updatewhitelist', async (req, res) => {
        if (!req.body.collectionName) {
            return res.status(400).send('No whitelist specified');
        }
        const updatedWhitelist = await updateValidationWhitelist(req.body);
        if (!!updatedWhitelist) {
            return res.status(200).send(updatedWhitelist);
        } else {
            return res.status(400).send('Whitelist not valid');
        }
    });

    router.delete('/deletewhitelist/:collectionName', async (req, res) => {
        await deleteValidationWhitelist(req.params.collectionName);
        res.send();
    });

    return router;
}
