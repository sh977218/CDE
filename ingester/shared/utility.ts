import * as mongo_cde from 'server/cde/mongo-cde';
import * as mongo_form from 'server/form/mongo-form';
import * as DiffJson from 'diff-json';
import { drop, findIndex, isEmpty } from 'lodash';
import { get } from 'request';
import { PhenxURL } from 'ingester/createMigrationConnection';
import * as cheerio from 'cheerio';
import { transferClassifications } from 'shared/system/classificationShared';

const sourceMap = {
    LOINC: ['LOINC'],
    PHENX: ['PhenX', 'PhenX Variable'],
    NINDS: ['NINDS', 'NINDS Variable Name', 'NINDS caDSR', 'caDSR'],
};
const today = new Date();
export const lastMigrationScript = 'load PhenX on ' + today.getMonth() + today.getFullYear();

export const BATCHLOADER_USERNAME = 'batchloader';
export const batchloader = {
    username: BATCHLOADER_USERNAME,
    roles: ['AttachmentReviewer']
};

export const created = today;
export const imported = today;

export function removeWhite(text) {
    if (!text) {
        return '';
    } else {
        return text.replace(/\s+/g, ' ');
    }
}

export function sanitizeText(s) {
    return s.replace(/:/g, '').replace(/\./g, '').trim();
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
        if (!obj.valueDomain.uom) {
            delete obj.valueDomain.uom;
        }
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

    Object.keys(obj).forEach(key => {
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
    const otherClassifications = existingClassification.filter(c => c.stewardOrg.name !== orgName);
    return newClassification.concat(otherClassifications);
}


export function updateCde(elt, user, options = {}) {
    return new Promise(resolve => mongo_cde.update(elt, user, options, resolve));
}

export function updateForm(elt, user, options = {}) {
    return new Promise(resolve => mongo_form.update(elt, user, options, resolve));
}

const DomainCollectionMap = {};

export function protocolLinkToProtocolId(href) {
    const indexString = '/protocols/view/';
    const protocolIdIndex = href.indexOf(indexString);
    return href.substr(protocolIdIndex + indexString.length, href.length);
}

export function getDomainCollection() {
    return new Promise((resolve, reject) => {
        if (!isEmpty(DomainCollectionMap)) {
            resolve(DomainCollectionMap);
        } else {
            get(PhenxURL, async (err, response, body) => {
                if (err) {
                    reject(err);
                }
                const $ = cheerio.load(body, {normalizeWhitespace: true});
                const table = $('#myTable');
                const trs = table.find('tbody tr');
                for (const tr of trs) {
                    const tds = $(tr).find('td');
                    if (tds.length !== 3) {
                        throw new Error('td length error.');
                    }
                    const a = $(tds[1]).find('a');
                    const href = $(a).attr('href');
                    const protocolLink = 'https://www.phenxtoolkit.org' + href;
                    const domainCollection = $(tds[2]).text().trim();
                    const protocolId = protocolLinkToProtocolId(href);
                    DomainCollectionMap[protocolId] = {protocolLink, domainCollection};
                }
                resolve(DomainCollectionMap);
            });
        }
    });
}

function getChildren(formElements) {
    let ids = [];
    if (formElements) {
        formElements.forEach(formElement => {
            if (formElement.elementType === 'section' || formElement.elementType === 'form') {
                const newIds = getChildren(formElement.formElements);
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
    if (newEltObj.elementType !== existingEltObj.elementType) {
        console.log(`Two element type different. newEltObj: ${newEltObj.tinyId} existingEltObj: ${existingEltObj.tinyId} `);
        process.exit(1);
    }
    const upperCaseSource = source.toUpperCase();
    const isQualified = existingEltObj.registrationState.registrationStatus === 'Qualified';
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
function mergeDesignation(existingDesignations, newDesignations) {
    existingDesignations.forEach(existingDesignation => {
        const i = findIndex(newDesignations, {designation: existingDesignation.designation});
        if (i !== -1) {
            newDesignations = drop(newDesignations, i);
        }
    });
    return existingDesignations.concat(newDesignations);
}

function mergeDefinition(existingDefinitions, newDefinitions) {
    if (!existingDefinitions) {
        existingDefinitions = [];
    }
    existingDefinitions.forEach(existingDefinition => {
        const i = findIndex(newDefinitions, {definition: existingDefinition.definition});
        if (i !== -1) {
            newDefinitions = drop(newDefinitions, i);
        }
    });
    return existingDefinitions.concat(newDefinitions);
}

export function mergeBySources(newSources, existingSources, sources) {
    if (!existingSources) {
        existingSources = [];
    }
    const otherSources = existingSources.filter(o => sources.indexOf(o.source) === -1);
    return newSources.concat(otherSources);
}

export function mergeSourcesBySourcesName(newSources, existingSources, sources) {
    if (!existingSources) {
        existingSources = [];
    }
    const otherSources = existingSources.filter(o => sources.indexOf(o.sourceName) === -1);
    return newSources.concat(otherSources);
}

export function mergeElt(existingEltObj, newEltObj, source) {
    if (newEltObj.elementType !== existingEltObj.elementType) {
        console.log(`Two element type different. newEltObj: ${newEltObj.tinyId} existingEltObj: ${existingEltObj.tinyId} `);
        process.exit(1);
    }
    const upperCaseSource = source.toUpperCase();
    const sources = sourceMap[upperCaseSource]; // ['PhenX', 'PhenX Variable']
    existingEltObj.designations = mergeDesignation(existingEltObj.designations, newEltObj.designations);
    existingEltObj.definitions = mergeDefinition(existingEltObj.definitions, newEltObj.definitions);

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
    const minLengthString = datatypeText.minLength;
    const minLength = parseInt(minLengthString, 10);

    const maxLengthString = datatypeText.maxLength;
    const maxLength = parseInt(maxLengthString, 10);

    const result: any = {};
    if (!isNaN(minLength)) {
        result.minLength = minLength;
    }
    if (!isNaN(maxLength)) {
        result.maxLength = maxLength;
    }
    return result;
}

function fixDatatypeNumber(datatypeNumber) {
    const minValueString = datatypeNumber.minValue;
    const minValue = parseInt(minValueString, 10);

    const maxValueString = datatypeNumber.maxValue;
    const maxValue = parseInt(maxValueString, 10);

    const result: any = {};
    if (!isNaN(minValue)) {
        result.minValue = minValue;
    }
    if (!isNaN(maxValue)) {
        result.maxValue = maxValue;
    }
    return result;
}

function fixDatatypeDate(datatypeDate) {
    const precisionString = datatypeDate.precision + '';
    const precision = precisionString.trim();

    const result: any = {};
    if (precision) {
        result.precision = precision;
    }
    return result;
}

function fixDatatypeTime(datatypeTime) {
    const formatString = datatypeTime.format + '';
    const format = formatString.trim();

    const result: any = {};
    if (format) {
        result.format = format;
    }
    return result;
}

function fixDatatypeDynamicCodeList(datatypeDynamicCodeList) {
    const systemString = datatypeDynamicCodeList.system + '';
    const system = systemString.trim();

    const codeString = datatypeDynamicCodeList.code + '';
    const code = codeString.trim();

    const result: any = {};
    if (system) {
        result.system = system;
    }
    if (code) {
        result.code = code;
    }
    return result;
}

function fixDatatypeValueList(datatypeValueList) {
    const datatypeString = datatypeValueList.datatype + '';
    const datatype = datatypeString.trim();

    const result: any = {};
    if (datatype) {
        result.datatype = datatype;
    }
    return result;
}

function fixDatatypeExternallyDefined(datatypeExternallyDefined) {
    const linkString = datatypeExternallyDefined.link;
    const link = linkString.trim();

    const descriptionString = datatypeExternallyDefined.description;
    const description = descriptionString.trim();

    const descriptionFormatString = datatypeExternallyDefined.descriptionFormat;
    const descriptionFormat = descriptionFormatString.trim();

    const result: any = {};
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
    const datatype = obj.datatype;
    if (datatype === 'Text' && !isEmpty(datatype.datatypeText)) {
        obj.datatypeText = fixDatatypeText(obj.datatypeText);
    }

    if (datatype === 'Number' && !isEmpty(datatype.datatypeNumber)) {
        obj.datatypeNumber = fixDatatypeNumber(obj.datatypeNumber);
    }

    if (datatype === 'Date' && !isEmpty(datatype.datatypeDate)) {
        obj.datatypeDate = fixDatatypeDate(obj.datatypeDate);
    }

    if (datatype === 'Time' && !isEmpty(datatype.datatypeTime)) {
        obj.datatypeTime = fixDatatypeTime(obj.datatypeTime);
    }

    if (datatype === 'Dynamic Code List' && !isEmpty(datatype.datatypeDynamicCodeList)) {
        obj.datatypeDynamicCodeList = fixDatatypeDynamicCodeList(obj.datatypeDynamicCodeList);
    }

    if (datatype === 'Value List' && !isEmpty(datatype.datatypeValueList)) {
        obj.datatypeValueList = fixDatatypeValueList(obj.datatypeValueList);
    }

    if (datatype === 'Externally Defined' && !isEmpty(datatype.datatypeExternallyDefined)) {
        obj.datatypeExternallyDefined = fixDatatypeExternallyDefined(obj.datatypeExternallyDefined);
    }
}


