import * as mongo_cde from '../../server/cde/mongo-cde';
import * as mongo_form from '../../server/form/mongo-form';

export function removeWhite(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ');
}

export function wipeUseless(toWipeCde) {
    delete toWipeCde._id;
    delete toWipeCde.history;
    delete toWipeCde.imported;
    delete toWipeCde.created;
    delete toWipeCde.createdBy;
    delete toWipeCde.updated;
    delete toWipeCde.updatedBy;
    delete toWipeCde.comments;
    delete toWipeCde.registrationState;
    delete toWipeCde.tinyId;
    delete toWipeCde.valueDomain.datatypeValueList;

    Object.keys(toWipeCde).forEach(function (key) {
        if (Array.isArray(toWipeCde[key]) && toWipeCde[key].length === 0) {
            delete toWipeCde[key];
        }
    });
}

export function trimWhite(text) {
    if (!text) {
        return '';
    } else {
        return text.trim().replace(/\s+/g, ' ');
    }
}

export function printUpdateResult(updateResult, elt) {
    if (updateResult.nModified) {
        console.log(`${updateResult.nModified} ${elt.type} source modified: ${elt.tinyId}`);
    }
    if (updateResult.upserted && updateResult.upserted.length) {
        console.log(`${updateResult.upserted.length} ${elt.type} source inserted: ${elt.tinyId}`);
    }
}

export function updateCde(elt, user, options = {}) {
    return new Promise(resolve => mongo_cde.update(elt, user, options, resolve));
}

export function updateForm(elt, user, options = {}) {
    return new Promise(resolve => mongo_form.update(elt, user, options, resolve));
}