var mongo_data_form = require('./mongo-form'),
    adminSvc = require('../../system/node-js/adminItemSvc.js'),
    JXON = require('jxon'),
    async = require('async'),
    authorization = require('../../system/node-js/authorization'),
    dbLogger = require('../../system/node-js/dbLogger'),
    fs = require("fs"),
    mongo_data_system = require('../../system/node-js/mongo-data'),
    md5_file = require("md5-file"),
    md5 = require("md5"),
    Readable = require('stream').Readable
;

exports.findForms = function (req, res) {
    mongo_data_form.findForms(req.body.criteria, function (err, forms) {
        res.send(forms);
    });
};
exports.findAllCdesInForm = function (node, map, array) {
    if (node.formElements) {
        for (var i = 0; i < node.formElements.length; i++) {
            if (node.formElements[i].elementType === "question") {
                map[node.formElements[i].question.cde.tinyId] = node.formElements[i].question.cde;
                array.push(node.formElements[i].question.cde.tinyId);
            }
            exports.findAllCdesInForm(node.formElements[i], map, array);
        }
    }
};

function getFormForPublishing(form, req, res) {
    if (req.isAuthenticated()) {
        fs.readFile("modules/form/public/html/nativeRenderStandalone.html", "UTF-8", function (err, fileStr) {
            var lines = fileStr.split("\n");
            var cssFileName = null, jsHash = null;
            lines.forEach(l => {
                if (l.includes("<link") && l.includes('href="/form/public/assets/css/styles-printable-')) {
                    cssFileName = l.substring(l.indexOf('/css/') + 5, l.indexOf('.css"') + 4);
                }
            });
            var jsFileName;
            lines.forEach(l => {
                if (l.includes("<script") && l.includes('src="/form/public/assets/js/vendor-printable')) {
                    jsFileName = l.substring(l.indexOf('/js/') + 4, l.indexOf('.js"') + 3);
                    jsHash = jsFileName.substring(jsFileName.indexOf("printable-") + 10, jsFileName.indexOf(".js") + 3);
                }
            });
            var jsPrintFileName;
            var jsPrintHash = null;
            lines.forEach(l => {
                if (l.includes("<script") && l.includes('src="/system/public/assets/js/print')) {
                    jsPrintFileName = l.substring(l.indexOf('/js/') + 4, l.indexOf('.js"') + 3);
                    jsPrintHash = jsPrintFileName.substring(jsPrintFileName.indexOf("printable-") + 10, jsPrintFileName.indexOf(".js") + 3);
                }
            });

            function storeHtmlInDb(req, res, form, fileStr) {
                var readable = new Readable();
                readable.push(fileStr);
                readable.push(null);
                var f = {
                    filename: "published-" + form.tinyId,
                    type: "text/html",
                    stream: readable,
                    md5: md5(fileStr)
                };
                mongo_data_system.addFile(f, function (err, newFile) {
                    mongo_data_system.userById(req.user._id, function (err, user) {
                        if (!user.publishedForms) user.publishedForms = [];
                        user.publishedForms.push({
                            name: req.body.publishedFormName,
                            id: newFile._id
                        });
                        user.save(function (err) {
                            if (err) res.status(500).send("Unable to save");
                            res.send(newFile._id);
                        });
                    });
                });
            }


            if (!jsFileName || !cssFileName) { // dev
                fileStr = fileStr.replace("<!-- IFH -->", "<script>window.formElt = " + JSON.stringify(form) + ";" +
                    "window.endpointUrl = '" + req.body.endpointUrl + "';</script>");
                storeHtmlInDb(req, res, form, fileStr);
            } else {
                //Remove all CSS and JS link
                fileStr = lines.filter(l => !l.includes("<link") && !l.includes("<script src=")).join("\n");

                fileStr = fileStr.replace("<!-- IFH -->", "<script>window.formElt = " + JSON.stringify(form) + ";" +
                    "window.endpointUrl = '" + req.body.endpointUrl + "';</script>");
                fs.readFile("modules/form/public/assets/css/" + cssFileName, "UTF-8", function (err, cssStr) {
                    if (err) dbLogger.consoleLog(err, 'error');
                    fileStr = fileStr.replace("<!-- ICSSH -->", "<style>" + cssStr + "</style>");
                    var filePath = "modules/form/public/assets/js/" + jsFileName;
                    var filePrintPath = "modules/system/public/assets/js/" + jsPrintFileName;
                    md5_file(filePath, function (err, hash) {
                        md5_file(filePrintPath, function (err, hashPrint) {
                            var f = {
                                filename: jsFileName,
                                type: "text/javascript",
                                stream: fs.createReadStream(filePath),
                                md5: hash
                            };
                            mongo_data_system.addFile(f, function (err, newJsFile) {
                                var fp = {
                                    filename: jsPrintFileName,
                                    type: "text/javascript",
                                    stream: fs.createReadStream(filePrintPath),
                                    md5: hashPrint
                                };
                                mongo_data_system.addFile(fp, function (err, newJsPrintFile) {
                                    fileStr = fileStr.replace("<!-- IJSH -->",
                                        '<script src="/data/' + newJsFile._id + '"></script>' +
                                        '<script src="/data/' + newJsPrintFile._id + '"></script>'
                                    );
                                    storeHtmlInDb(req, res, form, fileStr);
                                });
                            });
                        });
                    });
                })
            }

        });
    } else {
        res.status(401).send("Not Authorized");
    }
}

exports.publishForm = function (req, res) {
    mongo_data_form.eltByTinyId(req.body.formId, function (err, form) {
        getFormForPublishing(form, req, res);
    });
};

exports.fetchWholeForm = function (Form, callback) {
    var maxDepth = 8;
    var depth = 0;
    var form = JSON.parse(JSON.stringify(Form));
    var loopFormElements = function (form, cb) {
        if (form.formElements) {
            async.forEach(form.formElements, function (fe, doneOne) {
                if (fe.elementType === 'form') {
                    depth++;
                    if (depth < maxDepth) {
                        mongo_data_form.byTinyIdAndVersion(fe.inForm.form.tinyId, fe.inForm.form.version, function (err, result) {
                            result = result.toObject();
                            fe.formElements = result.formElements;
                            loopFormElements(fe, function () {
                                depth--;
                                doneOne();
                            });
                        });
                    } else {
                        doneOne();
                    }
                } else if (fe.elementType === 'section') {
                    loopFormElements(fe, function () {
                        doneOne();
                    });
                } else {
                    doneOne();
                }
            }, function doneAll() {
                cb();
            });
        }
        else {
            cb();
        }
    };
    loopFormElements(form, function () {
        if (form.toObject) form = form.toObject();
        callback(form);
    });
};


