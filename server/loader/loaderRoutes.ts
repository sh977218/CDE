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

export function module() {
    const router = Router();

    router.post('/validateCSVLoad', multer({...config.multer, storage: multer.memoryStorage()}).any(), async (req, res) => {
        if (!req.files) {
            res.status(400).send('No file uploaded for validation');
            return;
        }
        const fileBuffer = (req.files as any)[0].buffer;
        const reportOutput = await runValidationOnLoadCSV(fileBuffer);
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

    router.get('/whitelists', async (req, res) => {
        const whitelists = await getValidationWhitelists();
        res.send(whitelists);
    });

    router.post('/addNewWhitelist', async (req, res) => {
        if (!req.body.newWhitelist || !req.body.newWhitelist.trim()) {
            return res.status(400).send('No name for new whitelist provided');
        }
        const newTermsList: string = req.body.newWhitelistTerms;
        const newTerms = newTermsList.split('|').filter(t => t.trim()).map(t => t.trim());

        await addValidationWhitelist(req.body.newWhitelist.trim(), newTerms);
        return res.status(200).send('Whitelist created');
    });

    router.post('/updatewhitelist', async (req, res) => {
        if (!req.body.whitelistName) {
            return res.status(400).send('No whitelist specified');
        }
        const updatedWhitelist = await updateValidationWhitelist(req.body.whitelistName, req.body.newTerms, req.body.removeTerms);
        if (!!updatedWhitelist) {
            return res.status(200).send({terms: updatedWhitelist.terms});
        } else {
            return res.status(400).send('Whitelist not valid');
        }
    });

    router.delete('/deletewhitelist/:name', async (req, res) => {
        await deleteValidationWhitelist(req.params.name);
        res.send();
    });

    return router;
}
