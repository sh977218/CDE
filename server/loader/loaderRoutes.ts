import { Router } from 'express';
import { runValidationOnLoadCSV } from 'server/loader/validators';

import * as Config from 'config';
import * as multer from 'multer';

export function module() {
    const router = Router();
    const config = Config as any;

    router.post('/validateCSVLoad', multer({...config.multer, storage: multer.memoryStorage()}).any(), async (req, res) => {
        if (!req.files) {
            res.status(400).send('No file uploaded for validation');
            return;
        }
        const fileBuffer = (req.files as any)[0].buffer;
        const reportOutput = await runValidationOnLoadCSV(fileBuffer);
        let responseText = '';
        if (!!reportOutput) {
            responseText += 'Row numbers are based on CSV file.\n\n';
            responseText += reportOutput;
        } else {
            responseText = 'No issues found';
        }
        res.send(responseText);
    });

    return router;
}
