const DataElement = require('../server/cde/mongo-cde').DataElement;
const Form = require('../server/form/mongo-form').Form;

let deCount = 0;
let formCount = 0;

function removeWhite(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ');
}

function loopFes(fes) {
    for (let fe of fes) {
        let type = fe.elementType;
        fe.label = removeWhite(fe.label);
        if (fe.skipLogic && fe.skipLogic.condition) {
            fe.skipLogic.condition = removeWhite(fe.skipLogic.condition);
        }
        if (type === 'question') {
            fe.question.cde.name = removeWhite(fe.question.cde.name);
        }
        if (type === 'section') {
            loopFes(fe.formElements);
        }
    }
}

function runDe() {
    DataElement.find({archived: false, 'designations.designation': /[\n\r\t]/}).cursor()
        .eachAsync(elt => {
            return new Promise((resolve, reject) => {
                let eltObj = elt.toObject();
                eltObj.designations.forEach(d => {
                    d.designation = removeWhite(d.designation);
                });
                elt.designations = eltObj.designations;
                elt.save(err => {
                    if (err) {
                        console.log(err);
                        process.exit(1)
                    } else {
                        deCount++;
                        console.log('deCount: ' + deCount);
                        if (deCount % 200 === 0) {
                            setTimeout(() => resolve(), 5000);
                        } else resolve();
                    }
                });
            });
        }).then(() => console.log('Finished. deCount: ' + deCount), err => console.log(err));
}

function runForm() {
    Form.find({archived: false}).cursor()
        .eachAsync(elt => {
            return new Promise((resolve, reject) => {
                elt.designations.forEach(d => {
                    d.designation = removeWhite(d.designation);
                });
                elt.markModified('designations');
                loopFes(elt.formElements);
                elt.markModified('formElements');
                elt.save(err => {
                    if (err) {
                        console.log(err);
                        process.exit(1)
                    } else {
                        formCount++;
                        console.log('formCount: ' + formCount);
                        if (formCount % 200 === 0) {
                            setTimeout(() => resolve(), 5000);
                        } else resolve();
                    }
                });
            })
        }).then(() => console.log('Finished. formCount: ' + formCount), err => console.log(err));
}

runDe();
runForm();