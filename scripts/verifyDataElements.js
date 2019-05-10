const Ajv = require('ajv');
const config = require('config');
const mongo_cde = require('../server/cde/mongo-cde');
const verifyElt = require('./verifyElt');

let filter = () => false;
const devBlacklist = ['XyEbt94V_'];
if (config.publicUrl === 'http://localhost:3001') { // DEV
    filter = elt => devBlacklist.includes(elt.tinyId);
}

verifyElt.verifyObjectId(mongo_cde.DataElement, streamElts);

function streamElts(badIds) {
    badIds.forEach(id => verifyElt.addError(id, '_id has to be ObjectId'));
    mongo_cde.DataElement.find({}).cursor().eachAsync(elt => {
        if (filter(elt)) {
            console.log('skipped filtered tinyId:' + elt.tinyId + ' _id:' + elt._id);
            return;
        }
        verifyElt.count++;
        if (verifyElt.cleanup) {
            let changed = false;

            // Elt
            changed = verifyElt.fixElt(elt) || changed;

            // Data Element
            const changedList = verifyElt.fixDatatypeContainer(elt.valueDomain);
            changedList.forEach(c => elt.markModified('valueDomain.' + c));
            if (changedList.length) {
                changed = true;
            }
            changed = verifyElt.fixIds(elt.valueDomain.ids) || changed;
            const permissibleValues = verifyElt.fixPermissibleValues(elt.valueDomain.permissibleValues, elt.valueDomain.datatype);
            if (permissibleValues !== null) {
                changed = true;
                elt.valueDomain.permissibleValues = permissibleValues;
            }

            if (changed) {
                verifyElt.fixed++;
                if (badIds.includes(elt._id.toString())) {
                    verifyElt.addError(elt._id, 'cannot save due to bad _id type');
                } else {
                    elt.save().then(validate, err => verifyElt.addError(elt._id, err));
                }
            }
        }
        return validate(elt);
    })
        .then(verifyElt.finished, verifyElt.exitWithError);
}

function validate(elt) {
    return mongo_cde.validateSchema(elt).catch(err => {
        if (err instanceof Ajv.ValidationError) {
            verifyElt.addError(elt._id, err.errors.map(e => e.dataPath + ': ' + e.message).join(', '));
        } else {
            verifyElt.exitWithError(err);
        }
    });
}
