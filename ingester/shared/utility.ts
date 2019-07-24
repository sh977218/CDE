import * as mongo_cde from 'server/cde/mongo-cde';
import * as mongo_form from 'server/form/mongo-form';
import * as DiffJson from 'diff-json';

import { generateTinyId } from 'server/system/mongo-data';

export const BATCHLOADER_USERNAME = 'batchloader';

export const batchloader = {
    username: BATCHLOADER_USERNAME,
    roles: ['AttachmentReviewer']
};

export const created = new Date().toJSON();
export const imported = new Date().toJSON();

export let tinyId = generateTinyId();

export function removeWhite(text) {
    if (!text) {
        return '';
    } else {
        return text.replace(/\s+/g, ' ');
    }
}

export function sanitizeText(string) {
    return string.replace(/:/g, '').replace(/\./g, '').trim();
}

export function wipeBeforeCompare(obj) {
    delete obj._id;
    delete obj.__v;
    delete obj.tinyId;
    delete obj.changeNote;
    delete obj.source;
    delete obj.archived;
    delete obj.views;

    if (obj.valueDomain) {
        delete obj.valueDomain.datatypeValueList;
        if (!obj.valueDomain.uom) delete obj.valueDomain.uom;
    }

    delete obj.imported;
    delete obj.created;
    delete obj.createdBy;
    delete obj.updated;
    delete obj.updatedBy;

    delete obj.naming;
    delete obj.history;
    delete obj.classification;
    delete obj.attachments;
    delete obj.mappingSpecifications;
    delete obj.derivationRules;

    delete obj.lastMigrationScript;
    delete obj.registrationState;
    delete obj.comments;
    delete obj.formElements;

    Object.keys(obj).forEach(function (key) {
        if (Array.isArray(obj[key]) && obj[key].length === 0) {
            delete obj[key];
        }
    });
}

export function trimWhite(text) {
    if (!text) {
        return '';
    } else {
        return text.replace(/\s+/g, ' ').trim();
    }
}

export function printUpdateResult(updateResult, elt) {
    if (updateResult.nModified) {
        console.log(`${updateResult.nModified} ${elt.elementType} source modified: ${elt.tinyId}`);
    }
    if (updateResult.upserted && updateResult.upserted.length) {
        console.log(`${updateResult.upserted.length} ${elt.elementType} source inserted: ${elt.tinyId}`);
    }
}

function getChildren(formElements) {
    let ids = [];
    if (formElements) {
        formElements.forEach(formElement => {
            if (formElement.elementType === 'section' || formElement.elementType === 'form') {
                let newIds = getChildren(formElement.formElements);
                ids = ids.concat(newIds);
            } else if (formElement.elementType === 'question') {
                ids.push({
                    id: formElement.question.cde.tinyId,
                    version: formElement.question.cde.version
                });
            }
        });
    }
    return ids;
}

export function compareElt(newEltObj, existingEltObj) {
    [existingEltObj, newEltObj].forEach(obj => {
        obj.designations.sort((a, b) => a.designation >= b.designation);
        obj.definitions.sort((a, b) => a.definition >= b.definition);
        obj.ids.sort((a, b) => a.source >= b.source);
        obj.referenceDocuments.sort((a, b) => a.docType >= b.docType);
        obj.properties.sort((a, b) => a.key >= b.key);
        if (obj.elementType === 'form') {
            obj.cdeIds = getChildren(obj.formElements);
        }

        wipeBeforeCompare(obj);
    });
    return DiffJson.diff(existingEltObj, newEltObj);
}

export function replaceClassificationByOrg(newClassification, existingClassification, orgName) {
    let otherClassifications = existingClassification.filter(c => c.stewardOrg.name !== orgName)
    return newClassification.concat(otherClassifications);
}

export function mergeBySource(newSources, existingSources, sourceName) {
    let otherSources = existingSources.filter(o => o.source.indexOf(sourceName) === -1);
    return newSources.concat(otherSources);
}

export function mergeBySources(newSources, existingSources, sourceNames) {
    let otherSources = existingSources.filter(o => sourceNames.indexOf(o.source) === -1);
    return newSources.concat(otherSources);
}


export function updateCde(elt, user, options = {}) {
    return new Promise(resolve => mongo_cde.update(elt, user, options, resolve));
}

export function updateForm(elt, user, options = {}) {
    return new Promise(resolve => mongo_form.update(elt, user, options, resolve));
}