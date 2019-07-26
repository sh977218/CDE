import * as mongo_cde from 'server/cde/mongo-cde';
import * as mongo_form from 'server/form/mongo-form';
import * as DiffJson from 'diff-json';
import { drop, findIndex, isEmpty, uniq } from 'lodash';
import { get } from 'request';
import { PhenxURL } from 'ingester/createMigrationConnection';
import * as cheerio from 'cheerio';
import { transferClassifications } from 'shared/system/classificationShared';

const sourceMap = {
    'LOINC': ['LOINC'],
    'PHENX': ['PhenX', 'PhenX Variable'],
    'NINDS': ['NINDS', 'NINDS Variable Name', 'NINDS caDSR', 'caDSR'],
};
let today = new Date();
export const lastMigrationScript = 'load PhenX on ' + today.getMonth() + today.getFullYear();

export const BATCHLOADER_USERNAME = 'batchloader';
export const batchloader = {
    username: BATCHLOADER_USERNAME,
    roles: ['AttachmentReviewer']
};

export const created = new Date().toJSON();
export const imported = new Date().toJSON();

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
    delete obj.noRenderAllowed;
    delete obj.isCopyrighted;

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
    delete obj.displayProfiles;
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

export function replaceClassificationByOrg(newClassification, existingClassification, orgName) {
    let otherClassifications = existingClassification.filter(c => c.stewardOrg.name !== orgName)
    return newClassification.concat(otherClassifications);
}


export function updateCde(elt, user, options = {}) {
    return new Promise(resolve => mongo_cde.update(elt, user, options, resolve));
}

export function updateForm(elt, user, options = {}) {
    return new Promise(resolve => mongo_form.update(elt, user, options, resolve));
}

let DomainCollectionMap = {};

export function protocolLinkToProtocolId(href) {
    let indexString = '/protocols/view/';
    let protocolIdIndex = href.indexOf(indexString);
    let protocolId = href.substr(protocolIdIndex + indexString.length, href.length);
    return protocolId;
}

export function getDomainCollection() {
    return new Promise((resolve, reject) => {
        if (!isEmpty(DomainCollectionMap)) {
            resolve(DomainCollectionMap);
        } else {
            get(PhenxURL, async function (err, response, body) {
                if (err) reject(err);
                const $ = cheerio.load(body, {normalizeWhitespace: true});
                let table = $('#myTable');
                let trs = table.find('tbody tr');
                for (let i = 0; i < trs.length; i++) {
                    let tr = trs[i];
                    let tds = $(tr).find('td');
                    if (tds.length !== 3) throw 'td length error.';
                    let a = $(tds[1]).find('a');
                    let href = $(a).attr('href');
                    let protocolLink = 'https://www.phenxtoolkit.org' + href;
                    let domainCollection = $(tds[2]).text().trim();
                    let protocolId = protocolLinkToProtocolId(href);
                    DomainCollectionMap[protocolId] = {protocolLink, domainCollection};
                }
                resolve(DomainCollectionMap);
            })
        }
    })
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


// Compare two elements
export function compareElt(newEltObj, existingEltObj, source) {
    let upperCaseSource = source.toUpperCase();
    let isQualified = existingEltObj.registrationState.registrationStatus === 'Qualified';
    [existingEltObj, newEltObj].forEach(eltObj => {
        eltObj.designations.sort((a, b) => a.designation >= b.designation);
        eltObj.definitions.sort((a, b) => a.definition >= b.definition);
        ['designations', 'definitions'].forEach(p => {
            delete eltObj[p].sources;
        });

        eltObj.properties.sort((a, b) => a.key >= b.key);
        eltObj.referenceDocuments.sort((a, b) => a.docType >= b.docType);
        eltObj.ids.sort((a, b) => a.source >= b.source);
        ['properties', 'referenceDocuments', 'ids'].forEach(p => {
            eltObj[p] = eltObj[p].filter(a => sourceMap[upperCaseSource].indexOf(a.source) !== -1);
        });

        if (eltObj.elementType === 'form' && !isQualified) {
            eltObj.cdeIds = getChildren(eltObj.formElements);
        }

        wipeBeforeCompare(eltObj);

    });
    return DiffJson.diff(existingEltObj, newEltObj);
}

// Merge two elements
function mergeDesignation(existingDesignations, newDesignations, source) {
    existingDesignations.forEach(existingDesignation => {
        let i = findIndex(newDesignations, {designation: existingDesignation.designation});
        if (i !== -1) {
            existingDesignation.sources.push(source);
            existingDesignation.sources = uniq(existingDesignation.sources);
            newDesignations = drop(newDesignations, i);
        }
    });
    return existingDesignations.concat(newDesignations);
}

function mergeDefinition(existingDefinitions, newDefinitions, source) {
    existingDefinitions.forEach(existingDefinition => {
        let i = findIndex(newDefinitions, {definition: existingDefinition.definition});
        if (i !== -1) {
            existingDefinition.sources.push(source);
            existingDefinition.sources = uniq(existingDefinition.sources);
            newDefinitions = drop(newDefinitions, i);
        }
    });
    return existingDefinitions.concat(newDefinitions);
}

export function mergeBySources(newSources, existingSources, sources) {
    let otherSources = existingSources.filter(o => sources.indexOf(o.source) === -1);
    return newSources.concat(otherSources);
}

export function mergeSourcesBySourcesName(newSources, existingSources, sources) {
    let otherSources = existingSources.filter(o => sources.indexOf(o.sourceName) === -1);
    return newSources.concat(otherSources);
}

export function mergeElt(existingEltObj, newEltObj, source) {
    let upperCaseSource = source.toUpperCase();
    let sources = sourceMap[upperCaseSource]; // ['PhenX', 'PhenX Variable']
    existingEltObj.designations = mergeDesignation(existingEltObj.designations, newEltObj.designations, source);
    existingEltObj.definitions = mergeDefinition(existingEltObj.definitions, newEltObj.definitions, source);

    existingEltObj.ids = mergeBySources(newEltObj.ids, existingEltObj.ids, sources);
    existingEltObj.properties = mergeBySources(newEltObj.properties, existingEltObj.properties, sources);
    existingEltObj.referenceDocuments = mergeBySources(newEltObj.referenceDocuments, existingEltObj.referenceDocuments, sources);

    existingEltObj.sources = mergeSourcesBySourcesName(newEltObj.sources, existingEltObj.sources, sources);

    existingEltObj.attachments = newEltObj.attachments;
    existingEltObj.version = newEltObj.version;

    // Those 50 forms qualified, We don't want to modify form elements.
    if (existingEltObj.registrationState.registrationStatus !== 'Qualified') {
        existingEltObj.formElements = newEltObj.formElements;
    }
    if (existingEltObj.elementType === 'cde') {
        existingEltObj.property = newEltObj.property;
        existingEltObj.dataElementConcept = newEltObj.dataElementConcept;
        existingEltObj.objectClass = newEltObj.objectClass;
        existingEltObj.valueDomain = newEltObj.valueDomain;
    }

    if (existingEltObj.lastMigrationScript === lastMigrationScript) {
        transferClassifications(newEltObj, existingEltObj);
    } else {
        existingEltObj.classification = replaceClassificationByOrg(newEltObj.classification, existingEltObj.classification, source);
    }
}

// Fix data type
function fixDatatypeText(datatypeText) {
    let minLengthString = datatypeText.minLength;
    let minLength = parseInt(minLengthString);

    let maxLengthString = datatypeText.maxLength;
    let maxLength = parseInt(maxLengthString);

    let result: any = {};
    if (!isNaN(minLength)) {
        result.minLength = minLength;
    }
    if (!isNaN(maxLength)) {
        result.maxLength = maxLength;
    }
    return result;
}

function fixDatatypeNumber(datatypeNumber) {
    let minValueString = datatypeNumber.minValue;
    let minValue = parseInt(minValueString);

    let maxValueString = datatypeNumber.maxValue;
    let maxValue = parseInt(maxValueString);

    let result: any = {};
    if (!isNaN(minValue)) {
        result.minValue = minValue;
    }
    if (!isNaN(maxValue)) {
        result.maxValue = maxValue;
    }
    return result;
}

function fixDatatypeDate(datatypeDate) {
    let precisionString = datatypeDate.precision + '';
    let precision = precisionString.trim();

    let result: any = {};
    if (precision) {
        result.precision = precision;
    }
    return result;
}

function fixDatatypeTime(datatypeTime) {
    let formatString = datatypeTime.format + '';
    let format = formatString.trim();

    let result: any = {};
    if (format) {
        result.format = format;
    }
    return result;
}

function fixDatatypeDynamicCodeList(datatypeDynamicCodeList) {
    let systemString = datatypeDynamicCodeList.system + '';
    let system = systemString.trim();

    let codeString = datatypeDynamicCodeList.code + '';
    let code = codeString.trim();

    let result: any = {};
    if (system) {
        result.system = system;
    }
    if (code) {
        result.code = code;
    }
    return result;
}

function fixDatatypeValueList(datatypeValueList) {
    let datatypeString = datatypeValueList.datatype + '';
    let datatype = datatypeString.trim();

    let result: any = {};
    if (datatype) {
        result.datatype = datatype;
    }
    return result;
}

function fixDatatypeExternallyDefined(datatypeExternallyDefined) {
    let linkString = datatypeExternallyDefined.link + '';
    let link = linkString.trim();

    let descriptionString = datatypeExternallyDefined.description + '';
    let description = descriptionString.trim();

    let descriptionFormatString = datatypeExternallyDefined.descriptionFormat + '';
    let descriptionFormat = descriptionFormatString.trim();

    let result: any = {};
    if (link) {
        result.link = link;
    }
    if (description) {
        result.description = description;
    }
    if (descriptionFormat) {
        result.descriptionFormat = descriptionFormat;
    }
    return result;
}

export function fixValueDomainOrQuestion(obj) {
    let datatype = obj.datatype;
    if (datatype === 'Text' && !isEmpty(datatype.datatypeText)) {
        obj.datatypeText = fixDatatypeText(obj.datatypeText);
    }

    if (datatype === 'Number' && !isEmpty(datatype.datatypeNumber)) {
        obj.datatypeNumber = fixDatatypeNumber(obj.datatypeNumber)
    }

    if (datatype === 'Date' && !isEmpty(datatype.datatypeDate)) {
        obj.datatypeDate = fixDatatypeDate(obj.datatypeDate)
    }

    if (datatype === 'Time' && !isEmpty(datatype.datatypeTime)) {
        obj.datatypeTime = fixDatatypeTime(obj.datatypeTime)
    }

    if (datatype === 'Dynamic Code List' && !isEmpty(datatype.datatypeDynamicCodeList)) {
        obj.datatypeDynamicCodeList = fixDatatypeDynamicCodeList(obj.datatypeDynamicCodeList)
    }

    if (datatype === 'Value List' && !isEmpty(datatype.datatypeValueList)) {
        obj.datatypeValueList = fixDatatypeValueList(obj.datatypeValueList)
    }

    if (datatype === 'Externally Defined' && !isEmpty(datatype.datatypeExternallyDefined)) {
        obj.datatypeExternallyDefined = fixDatatypeExternallyDefined(obj.datatypeExternallyDefined)
    }
}


