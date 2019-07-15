import { ValidationError } from 'ajv';
import * as Config from 'config';
import { Form, validateSchema } from 'server/form/mongo-form';
import { iterateFeSync } from 'shared/form/fe';
import { Elt } from 'shared/models.model';
import {
    addError, cleanup, exitWithError, finished, fixDatatypeContainer, fixDesignations, fixElt, fixIds,
    fixPermissibleValues, isValueFormat, status, verifyObjectId
} from './verifyElt';

const config = Config as any;
let filter = (elt: Elt) => false;
const devBlacklist = ['QJgAXYdXv'];
if (config.publicUrl === 'http://localhost:3001') { // DEV
    filter = elt => devBlacklist.includes(elt.tinyId);
}

verifyObjectId(Form, streamElts);

function streamElts(badIds) {
    badIds.forEach(id => addError(id, '_id has to be ObjectId'));
    Form.find({}).cursor().eachAsync(elt => {
        if (filter(elt)) {
            console.log('skipped filtered tinyId:' + elt.tinyId + ' _id:' + elt._id);
            return;
        }
        status.count++;
        if (cleanup) {
            let changed = false;

            // Elt
            changed = fixElt(elt) || changed;

            // Form
            (function mustHaveElementType(fe) {
                if (!fe.elementType) {
                    fe.elementType = 'section';
                }
                fe.formElements && fe.formElements.forEach(mustHaveElementType);
            })(elt);
            const allFe = fe => {
                if (fe.instructions && !isValueFormat(fe.instructions.valueFormat)) {
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
                    const answers = fixPermissibleValues(q.question.answers, q.question.datatype);
                    if (answers !== null) {
                        q.question.answers = answers;
                        changed = true;
                    }
                    if (q.question.cde) {
                        const designations = fixDesignations(q.question.cde.designations, q.question.cde.name || q.label);
                        if (designations) {
                            q.question.cde.designations = designations;
                            changed = true;
                        }
                        changed = fixIds(q.question.cde.ids) || changed;
                        const permissibleValues = fixPermissibleValues(q.question.cde.permissibleValues, q.question.datatype);
                        if (permissibleValues !== null) {
                            q.question.cde.permissibleValues = permissibleValues;
                            changed = true;
                        }
                        if (!['undefined', 'string'].includes(typeof q.question.cde.version)) {
                            q.question.cde.version = undefined;
                            changed = true;
                        }
                    }
                    changed = !!fixDatatypeContainer(q.question).length || changed;
                }
            });

            if (changed) {
                status.fixed++;
                if (badIds.includes(elt._id.toString())) {
                    addError(elt._id, 'cannot save due to bad _id type');
                } else {
                    elt.markModified('formElements');
                    return elt.save().then(validate, err => addError(elt._id, err));
                }
            }
        }
        return validate(elt);
    })
        .then(finished, exitWithError);
}

function validate(elt) {
    return validateSchema(elt).catch(err => {
        if (err instanceof ValidationError) {
            addError(elt._id, err.errors.map(e => e.dataPath + ': ' + e.message).join(', '));
        } else {
            exitWithError(err);
        }
    });
}
