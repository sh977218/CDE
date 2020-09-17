import { renderFile } from 'ejs';
import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { handleError } from 'server/errorHandler/errorHandler';
import { addFile } from 'server/system/mongo-data';
import { CdeForm } from 'shared/form/form.model';
import { Readable } from 'stream';

const md5 = require('md5');
const md5File = require('md5-file');

function storeHtmlInDb(req: Request, res: Response, form: CdeForm, fileStr: string) {
    const readable = new Readable();
    readable.push(fileStr);
    readable.push(null);
    const f = {
        filename: 'published-' + form.tinyId, type: 'text/html', stream: readable, md5: md5(fileStr)
    };
    addFile(f, (err, newFile) => {
        const user = req.user;
        user.publishedForms.push({
            name: req.body.publishedFormName, id: newFile._id
        });
        user.save(handleError({req, res}, () => res.send(newFile._id)));
    });
}

export function getFormForPublishing(form: CdeForm, req: Request, res: Response) {
    renderFile('frontEnd/_nativeRenderApp/nativeRenderApp.ejs', {isLegacy: true, version: 'version'}, (err, fileStr) => {
        const lines = fileStr.split('\n');
        let cssFileName;
        const headIndex = lines.findIndex(l => l.includes('</head>'));
        lines.forEach((l, i) => {
            if (l.includes('<link') && l.includes('href="') && l.includes('.css')) {
                cssFileName = l.substring(l.indexOf('href="') + 6, l.indexOf('.css"') + 4);
                const content = readFileSync(`dist/${cssFileName}`);
                lines[i] = `<style type="text/css">${content}</style>`;
            }
            if (l.includes("deferCss('/")) {
                cssFileName = l.substring(l.indexOf("deferCss('") + 10, l.indexOf(".css'") + 4);
                const content = readFileSync(`dist/${cssFileName}`);
                lines.splice(headIndex, 0, `<style type="text/css">${content}</style>`);
                lines[i] = '';
            }
        });
        let jsFileName;
        lines.forEach((l, i) => {
            if (l.includes('<script') && l.includes('src="')) {
                jsFileName = l.substring(l.indexOf('src="') + 5, l.indexOf('.js"') + 3);
                const content = readFileSync(`dist/${jsFileName}`);
                lines[i] = `<script type="text/javascript">
                                ${content}
                            </script>`;
                // jsHash = jsFileName.substring(jsFileName.indexOf('polyfill-') + 9, jsFileName.indexOf('.js') + 3);
            }
        });
        fileStr = lines.join('\n');
        fileStr = fileStr.replace('<!-- IFH -->',
            '<script>window.formElt = ' + JSON.stringify(form) + ';' + "window.endpointUrl = '"
            + req.body.endpointUrl + "';</script>");
        storeHtmlInDb(req, res, form, fileStr);
    });
}
