import { update as updateCde } from '../../server/cde/mongo-cde';
import { update as updateForm } from '../../server/form/mongo-form';

export function removeWhite(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ');
};

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

export function printUpdateResult(updateResult, type) {
    if (updateResult.nModified) {
        console.log(updateResult.nModified + ' ' + type + ' source modified: ');
    }
    if (updateResult.upserted && updateResult.upserted.length) {
        console.log(updateResult.upserted.length + ' ' + type + ' source inserted: ');
    }
}

export function updateCde(elt, user, options = {}) {
    return new Promise(resolve => updateCde(elt, user, options, resolve));
}

export function updateForm(elt, user, options = {}) {
    return new Promise(resolve => updateForm(elt, user, {}, resolve));
}