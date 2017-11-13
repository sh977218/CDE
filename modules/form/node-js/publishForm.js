let fs = require("fs");
let Readable = require('stream').Readable;
let md5_file = require("md5-file");
let md5 = require("md5");
let mongo_data = require('../../system/node-js/mongo-data');
let dbLogger = require('../../system/node-js/dbLogger');

function storeHtmlInDb(req, res, form, fileStr) {
    let readable = new Readable();
    readable.push(fileStr);
    readable.push(null);
    let f = {
        filename: "published-" + form.tinyId, type: "text/html", stream: readable, md5: md5(fileStr)
    };
    mongo_data.addFile(f, function (err, newFile) {
        mongo_data.userById(req.user._id, function (err, user) {
            if (!user.publishedForms) user.publishedForms = [];
            user.publishedForms.push({
                name: req.body.publishedFormName, id: newFile._id
            });
            user.save(function (err) {
                if (err)
                    return res.status(500).send("Unable to save");
                res.send(newFile._id);
            });
        });
    });
}

exports.getFormForPublishing = function (form, req, res) {
    fs.readFile("modules/_nativeRenderApp/nativeRenderApp.html", "UTF-8", function (err, fileStr) {
        let lines = fileStr.split("\n");
        let cssFileName = null, jsHash = null;
        lines.forEach(l => {
            if (l.includes("<link") && l.includes('href="/static/styles-print-')) {
                cssFileName = l.substring(l.indexOf('/static/styles-print') + 8, l.indexOf('.css"') + 4);
            }
        });
        let jsFileName;
        lines.forEach(l => {
            if (l.includes("<script") && l.includes('src="/static/polyfill')) {
                jsFileName = l.substring(l.indexOf('/static/polyfill-') + 8, l.indexOf('.js"') + 3);
                jsHash = jsFileName.substring(jsFileName.indexOf("polyfill-") + 9, jsFileName.indexOf(".js") + 3);
            }
        });
        let jsPrintFileName;
        let jsPrintHash = null;
        lines.forEach(l => {
            if (l.includes("<script") && l.includes('src="/static/print')) {
                jsPrintFileName = l.substring(l.indexOf('/static/') + 4, l.indexOf('.js"') + 3);
                jsPrintHash = jsPrintFileName.substring(jsPrintFileName.indexOf("printable-") + 10, jsPrintFileName.indexOf(".js") + 3);
            }
        });

        if (!jsFileName || !cssFileName) { // dev
            fileStr = fileStr.replace("<!-- IFH -->", "<script>window.formElt = " + JSON.stringify(form) + ";" + "window.endpointUrl = '" + req.body.endpointUrl + "';</script>");
            storeHtmlInDb(req, res, form, fileStr);
        } else {
            //Remove all CSS and JS link
            fileStr = lines.filter(l => !l.includes("<link") && !l.includes("<script src=")).join("\n");

            fileStr = fileStr.replace("<!-- IFH -->", "<script>window.formElt = " + JSON.stringify(form) + ";" + "window.endpointUrl = '" + req.body.endpointUrl + "';</script>");
            fs.readFile("modules/static/" + cssFileName, "UTF-8", function (err, cssStr) {
                if (err) dbLogger.consoleLog(err, 'error');
                fileStr = fileStr.replace("<!-- ICSSH -->", "<style>" + cssStr + "</style>");
                let filePath = "modules/static/" + jsFileName;
                let filePrintPath = "modules/static/" + jsPrintFileName;
                md5_file(filePath, function (err, hash) {
                    md5_file(filePrintPath, function (err, hashPrint) {
                        let f = {
                            filename: jsFileName,
                            type: "text/javascript",
                            stream: fs.createReadStream(filePath),
                            md5: hash
                        };
                        mongo_data.addFile(f, function (err, newJsFile) {
                            let fp = {
                                filename: jsPrintFileName,
                                type: "text/javascript",
                                stream: fs.createReadStream(filePrintPath),
                                md5: hashPrint
                            };
                            mongo_data.addFile(fp, function (err, newJsPrintFile) {
                                fileStr = fileStr.replace("<!-- IJSH -->", '<script src="/data/' + newJsFile._id + '"></script>' + '<script src="/data/' + newJsPrintFile._id + '"></script>');
                                storeHtmlInDb(req, res, form, fileStr);
                            });
                        });
                    });
                });
            });
        }
    });
};
