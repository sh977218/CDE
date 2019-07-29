import { renderFile } from 'ejs';
import { handleError } from 'server/errorHandler/errorHandler';
const fs = require('fs');
const Readable = require('stream').Readable;
const md5_file = require('md5-file');
const md5 = require('md5');
const mongo_data = require('../system/mongo-data');
const dbLogger = require('../log/dbLogger');

function storeHtmlInDb(req, res, form, fileStr) {
    const readable = new Readable();
    readable.push(fileStr);
    readable.push(null);
    const f = {
        filename: 'published-' + form.tinyId, type: 'text/html', stream: readable, md5: md5(fileStr)
    };
    mongo_data.addFile(f, (err, newFile) => {
        const user = req.user;
        user.publishedForms.push({
            name: req.body.publishedFormName, id: newFile._id
        });
        user.save(handleError({req, res}, () => res.send(newFile._id)));
    });
}

export function getFormForPublishing(form, req, res) {
    renderFile('modules/_nativeRenderApp/nativeRenderApp.ejs', {isLegacy: true, version: 'version'}, (err, fileStr) => {
        const lines = fileStr.split('\n');
        let cssFileName;
        let jsHash;
        lines.forEach(l => {
            if (l.includes('<link') && l.includes('href="/static/styles-print-')) {
                cssFileName = l.substring(l.indexOf('/static/styles-print') + 8, l.indexOf('.css"') + 4);
            }
        });
        let jsFileName;
        lines.forEach(l => {
            if (l.includes('<script') && l.includes('src="/static/polyfill-')) {
                jsFileName = l.substring(l.indexOf('/static/polyfill-') + 8, l.indexOf('.js"') + 3);
                jsHash = jsFileName.substring(jsFileName.indexOf('polyfill-') + 9, jsFileName.indexOf('.js') + 3);
            }
        });
        let jsPrintFileName;
        let jsPrintHash = null;
        lines.forEach(l => {
            if (l.includes('<script') && l.includes('src="/static/print')) {
                jsPrintFileName = l.substring(l.indexOf('/static/') + 8, l.indexOf('.js"') + 3);
                jsPrintHash = jsPrintFileName.substring(jsPrintFileName.indexOf('printable-') + 10, jsPrintFileName.indexOf('.js') + 3);
            }
        });

        if (!jsFileName || !cssFileName) { // dev
            fileStr = fileStr.replace('<!-- IFH -->', '<script>window.formElt = ' + JSON.stringify(form) + ';' + "window.endpointUrl = '" + req.body.endpointUrl + "';</script>");
            storeHtmlInDb(req, res, form, fileStr);
        } else {
            // Remove all CSS and JS link
            fileStr = lines.filter(l => !l.includes('<link') && !l.includes('<script src=')).join('\n');

            fileStr = fileStr.replace('<!-- IFH -->', '<script>window.formElt = ' + JSON.stringify(form) + ';' + "window.endpointUrl = '" + req.body.endpointUrl + "';</script>");
            fs.readFile('modules/static/' + cssFileName, 'UTF-8', function(err, cssStr) {
                if (err) { dbLogger.consoleLog(err, 'error'); }
                fileStr = fileStr.replace('<!-- ICSSH -->', '<style>' + cssStr + '</style>');
                const filePath = 'modules/static/' + jsFileName;
                const filePrintPath = 'modules/static/' + jsPrintFileName;
                md5_file(filePath, function(err, hash) {
                    md5_file(filePrintPath, function(err, hashPrint) {
                        const f = {
                            filename: jsFileName,
                            type: 'text/javascript',
                            stream: fs.createReadStream(filePath),
                            md5: hash
                        };
                        mongo_data.addFile(f, function(err, newJsFile) {
                            const fp = {
                                filename: jsPrintFileName,
                                type: 'text/javascript',
                                stream: fs.createReadStream(filePrintPath),
                                md5: hashPrint
                            };
                            mongo_data.addFile(fp, function(err, newJsPrintFile) {
                                fileStr = fileStr.replace('<!-- IJSH -->', '<script src="/data/' + newJsFile._id + '"></script>' + '<script src="/data/' + newJsPrintFile._id + '"></script>');
                                storeHtmlInDb(req, res, form, fileStr);
                            });
                        });
                    });
                });
            });
        }
    });
}
