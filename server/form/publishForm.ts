import { renderFile } from 'ejs';
import { handleError } from 'server/errorHandler/errorHandler';
import { readFileSync } from 'fs';
const fs = require('fs');
const Readable = require('stream').Readable;
const md5File = require('md5-file');
const md5 = require('md5');
const mongoData = require('../system/mongo-data');
const dbLogger = require('../log/dbLogger');

function storeHtmlInDb(req, res, form, fileStr) {
    const readable = new Readable();
    readable.push(fileStr);
    readable.push(null);
    const f = {
        filename: 'published-' + form.tinyId, type: 'text/html', stream: readable, md5: md5(fileStr)
    };
    mongoData.addFile(f, (err, newFile) => {
        const user = req.user;
        user.publishedForms.push({
            name: req.body.publishedFormName, id: newFile._id
        });
        user.save(handleError({req, res}, () => res.send(newFile._id)));
    });
}

export function getFormForPublishing(form, req, res) {
    renderFile('modules/_nativeRenderApp/nativeRenderApp.ejs', {isLegacy: true, version: 'version'}, (err, fileStr) => {
        let lines = fileStr.split('\n');
        let cssFileName;
        let jsHash;
        lines.forEach((l, i) => {
            if (l.includes('<link') && l.includes('href="') && l.includes('.css')) {
                cssFileName = l.substring(l.indexOf('href="') + 6, l.indexOf('.css"') + 4);
                const content = readFileSync(`dist/${cssFileName}`);
                lines[i] = `<style type="text/css">${content}</style>`;
            }
        });
        let jsFileName;
        // lines.forEach((l, i) => {
        //     if (l.includes('<script') && l.includes('src="/common/')) {
        //         jsFileName = l.substring(l.indexOf('/common/') + 8, l.indexOf('.js"') + 3);
        //         // jsHash = jsFileName.substring(jsFileName.indexOf('polyfill-') + 9, jsFileName.indexOf('.js') + 3);
        //     }
        // });
        let jsPrintFileName;
        let jsPrintHash = null;
        lines.forEach(l => {
            if (l.includes('<script') && l.includes('src="/static/print')) {
                jsPrintFileName = l.substring(l.indexOf('/static/') + 8, l.indexOf('.js"') + 3);
                jsPrintHash = jsPrintFileName.substring(jsPrintFileName.indexOf('printable-') + 10, jsPrintFileName.indexOf('.js') + 3);
            }
        });

        if (!jsFileName || !cssFileName) { // dev
            lines = lines.filter(l => !((l.includes('<link') && l.includes('.css')) || (l.includes('<script ') && l.includes('src='))));
            fileStr = lines.join('\n');
            fileStr = fileStr.replace('<!-- IFH -->',
                '<script>window.formElt = ' + JSON.stringify(form) + ';' + "window.endpointUrl = '"
                + req.body.endpointUrl + "';</script>");
            storeHtmlInDb(req, res, form, fileStr);
        } else {
            // Remove all CSS and JS link
            fileStr = lines.filter(l => !l.includes('<link') && !l.includes('<script src=')).join('\n');

            fileStr = fileStr.replace('<!-- IFH -->', '<script>window.formElt = ' + JSON.stringify(form) + ';'
                + "window.endpointUrl = '" + req.body.endpointUrl + "';</script>");
            fs.readFile('modules/static/' + cssFileName, 'UTF-8', (err, cssStr) => {
                if (err) { dbLogger.consoleLog(err, 'error'); }
                fileStr = fileStr.replace('<!-- ICSSH -->', '<style>' + cssStr + '</style>');
                const filePath = 'modules/static/' + jsFileName;
                const filePrintPath = 'modules/static/' + jsPrintFileName;
                md5File(filePath, (err, hash) => {
                    md5File(filePrintPath, (err, hashPrint) => {
                        const f = {
                            filename: jsFileName,
                            type: 'text/javascript',
                            stream: fs.createReadStream(filePath),
                            md5: hash
                        };
                        mongoData.addFile(f, (err, newJsFile) => {
                            const fp = {
                                filename: jsPrintFileName,
                                type: 'text/javascript',
                                stream: fs.createReadStream(filePrintPath),
                                md5: hashPrint
                            };
                            mongoData.addFile(fp, (err, newJsPrintFile) => {
                                fileStr = fileStr.replace('<!-- IJSH -->', '<script src="/data/' + newJsFile._id
                                    + '"></script>' + '<script src="/data/' + newJsPrintFile._id + '"></script>');
                                storeHtmlInDb(req, res, form, fileStr);
                            });
                        });
                    });
                });
            });
        }
    });
}
