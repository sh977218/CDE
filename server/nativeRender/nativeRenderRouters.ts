import { Router } from 'express';
import { version } from '../version';
import * as path from 'path';
import * as fs from 'fs';

export function module() {
    const router = Router();

    let indexHtml = '';
    try {
        indexHtml = fs.readFileSync(path.join(process.cwd(), 'dist/nativeRender/index.html'), 'UTF-8');
    } catch (e) {
        console.error("Missing file index.html. Run 'ng build nativeRender' and retry");
        process.exit(1);
    }
    // replace version
    indexHtml = indexHtml.replace('="version"', `="${version}"`);

    router.get('/', (req, res) => {
        res.send(indexHtml);
    });

    return router;
}
