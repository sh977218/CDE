import { forEachSeries} from 'async';
import { byTinyIdAndVersion } from 'server/cde/mongo-cde';
import { formModel, byTinyIdAndVersion as formByTinyIdAndVersion } from 'server/form/mongo-form';

let count = 0;
let cursor = formModel.find({}).cursor();

function loopFormElements(f, cb) {
    if (!f) return cb();
    if (!f.formElements) f.formElements = [];
    forEachSeries(f.formElements, function (fe: any, doneOne) {
        if (fe.elementType === "section") {
            loopFormElements(fe, doneOne);
        } else if (fe.elementType === "form") {
            let tinyId = fe.question.cde.tinyId;
            let version = fe.question.cde.version ? fe.question.cde.version : null;
            formByTinyIdAndVersion(tinyId, version, function (err, form) {
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
            byTinyIdAndVersion(tinyId, version, function (err, dataElement) {
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
                if (count % 1000 === 0) setTimeout(resolve, 5000);
                else resolve();
            });
        });
    });
}).then(err => {
    if (err) throw err;
    console.log("Finished all. count: " + count);
    process.exit(1);
});
