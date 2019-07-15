import { ValidationError } from 'ajv';
import * as Config from 'config';
import { DataElement, validateSchema } from 'server/cde/mongo-cde';
import { Elt } from 'shared/models.model';
import {
    addError, cleanup, exitWithError, finished, fixDatatypeContainer, fixElt, fixIds, fixPermissibleValues, status,
    verifyObjectId
} from './verifyElt';

const config = Config as any;
let filter = (elt: Elt) => false;
const devBlacklist = ['XyEbt94V_'];
if (config.publicUrl === 'http://localhost:3001') { // DEV
    filter = elt => devBlacklist.includes(elt.tinyId);
}

verifyObjectId(DataElement, streamElts);

function streamElts(badIds) {
    badIds.forEach(id => addError(id, '_id has to be ObjectId'));
    DataElement.find({}).cursor().eachAsync(elt => {
        if (filter(elt)) {
            console.log('skipped filtered tinyId:' + elt.tinyId + ' _id:' + elt._id);
            return;
        }
        status.count++;
        if (cleanup) {
            let changed = false;

            // Elt
            changed = fixElt(elt) || changed;

            // Data Element
            const changedList = fixDatatypeContainer(elt.valueDomain);
            changedList.forEach(c => elt.markModified('valueDomain.' + c));
            if (changedList.length) {
                changed = true;
            }
            changed = fixIds(elt.valueDomain.ids) || changed;
            const permissibleValues = fixPermissibleValues(elt.valueDomain.permissibleValues, elt.valueDomain.datatype);
            if (permissibleValues !== null) {
                changed = true;
                elt.valueDomain.permissibleValues = permissibleValues;
            }

            if (changed) {
                status.fixed++;
                if (badIds.includes(elt._id.toString())) {
                    addError(elt._id, 'cannot save due to bad _id type');
                } else {
                    elt.save().then(validate, err => addError(elt._id, err));
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
