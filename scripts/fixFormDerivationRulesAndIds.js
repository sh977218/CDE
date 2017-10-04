const async = require('async');
const mongo_cde = require('../modules/cde/node-js/mongo-cde');
const mongo_form = require('../modules/form/node-js/mongo-form');
const FormModal = mongo_form.Form;

let count = 0;
let cursor = FormModal.find({archived: false}).cursor();

function loopFormElements(f, cb) {
    if (!f) return cb();
    if (!f.formElements) f.formElements = [];
    async.forEachSeries(f.formElements, function (fe, doneOne) {
        if (fe.elementType === "section") {
            loopFormElements(fe, doneOne);
        } else if (fe.elementType === "form") {
            let tinyId = fe.question.cde.tinyId;
            let version = fe.question.cde.version ? fe.question.cde.version : null;
            mongo_form.byTinyIdVersion(tinyId, version, function (err, form) {
                if (err || !form) cb(err);
                else {
                    let systemForm = form.toObject();
                    fe.inForm.form.ids = systemForm.ids;
                    loopFormElements(fe, doneOne);
                }
            });
        } else {
            let tinyId = fe.question.cde.tinyId;
            let version = fe.question.cde.version ? fe.question.cde.version : null;
            mongo_cde.byTinyIdVersion(tinyId, version, function (err, dataElement) {
                if (err || !dataElement) cb(err);
                else {
                    let systemDe = dataElement.toObject();
                    fe.question.cde.derivationRules = systemDe.derivationRules;
                    doneOne();
                }
            });
        }
    }, function doneAll() {
        cb();
    });
}

cursor.eachAsync(function (form) {
    return new Promise(function (resolve) {
        loopFormElements(form, err => {
            if (err) throw err;
            form.save(err => {
                if (err) throw err;
                count++;
                console.log("count: " + count);
                resolve();
            });
        });
    });
}).then(err => {
    if (err) throw err;
    console.log("Finished all. count: " + count);
});
