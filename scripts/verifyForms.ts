import { Elt } from 'shared/models.model';
import { iterateFeSync } from '../shared/form/fe';

const Ajv = require('ajv');
const config = require('config');
const mongo_form = require('../server/form/mongo-form');
const verifyElt = require('./verifyElt');

let filter = (elt: Elt) => false;
const devBlacklist = ['QJgAXYdXv'];
if (config.publicUrl === 'http://localhost:3001') { // DEV
    filter = elt => devBlacklist.includes(elt.tinyId);
}

verifyElt.verifyObjectId(mongo_form.Form, streamElts);

function streamElts(badIds) {
    badIds.forEach(id => verifyElt.addError(id, '_id has to be ObjectId'));
    mongo_form.Form.find({}).cursor().eachAsync(elt => {
        if (filter(elt)) {
            console.log('skipped filtered tinyId:' + elt.tinyId + ' _id:' + elt._id);
            return;
        }
        verifyElt.count++;
        if (verifyElt.cleanup) {
            let changed = false;

            // Elt
            changed = verifyElt.fixElt(elt) || changed;

            // Form
            (function mustHaveElementType(fe) {
                if (!fe.elementType) {
                    fe.elementType = 'section';
                }
                fe.formElements && fe.formElements.forEach(mustHaveElementType);
            })(elt);
            const allFe = fe => {
                if (fe.instructions && !verifyElt.isValueFormat(fe.instructions.valueFormat)) {
                    fe.instructions.valueFormat = undefined;
                    changed = true;
                }
            };
            const notAQuestion = fe => {
                allFe(fe);
                if (fe.question) {
                    fe.question = undefined;
                    changed = true;
                }
            };
            iterateFeSync(elt, notAQuestion, notAQuestion, q => {
                allFe(q);
                if (q.question) {
                    const answers = verifyElt.fixPermissibleValues(q.question.answers, q.question.datatype);
                    if (answers !== null) {
                        q.question.answers = answers;
                        changed = true;
                    }
                    if (q.question.cde) {
                        const designations = verifyElt.fixDesignations(q.question.cde.designations, q.question.cde.name || q.label);
                        if (designations) {
                            q.question.cde.designations = designations;
                            changed = true;
                        }
                        changed = verifyElt.fixIds(q.question.cde.ids) || changed;
                        const permissibleValues = verifyElt.fixPermissibleValues(q.question.cde.permissibleValues, q.question.datatype);
                        if (permissibleValues !== null) {
                            q.question.cde.permissibleValues = permissibleValues;
                            changed = true;
                        }
                        if (!['undefined', 'string'].includes(typeof q.question.cde.version)) {
                            q.question.cde.version = undefined;
                            changed = true;
                        }
                    }
                    changed = !!verifyElt.fixDatatypeContainer(q.question).length || changed;
                }
            });

            if (changed) {
                verifyElt.fixed++;
                if (badIds.includes(elt._id.toString())) {
                    verifyElt.addError(elt._id, 'cannot save due to bad _id type');
                } else {
                    elt.markModified('formElements');
                    return elt.save().then(validate, err => verifyElt.addError(elt._id, err));
                }
            }
        }
        return validate(elt);
    })
        .then(verifyElt.finished, verifyElt.exitWithError);
}

function validate(elt) {
    return mongo_form.validateSchema(elt).catch(err => {
        if (err instanceof Ajv.ValidationError) {
            verifyElt.addError(elt._id, err.errors.map(e => e.dataPath + ': ' + e.message).join(', '));
        } else {
            verifyElt.exitWithError(err);
        }
    });
}
