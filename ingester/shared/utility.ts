import * as DiffJson from 'diff-json';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import { get } from 'request';
import { findIndex, isEmpty, uniq } from 'lodash';
import * as mongo_cde from 'server/cde/mongo-cde';
import * as mongo_form from 'server/form/mongo-form';
import { PhenxURL } from 'ingester/createMigrationConnection';
import { transferClassifications } from 'shared/system/classificationShared';
import { Classification, Definition, Designation } from 'shared/models.model';
import { FormElement } from 'shared/form/form.model';

const sourceMap = {
    LOINC: ['LOINC'],
    PHENX: ['PhenX', 'PhenX Variable'],
    NINDS: ['NINDS', 'NINDS Variable Name', 'NINDS caDSR', 'caDSR'],
    NCI: ['caDSR']
};
export const TODAY = new Date().toJSON();
export const lastMigrationScript = `load PhenX on ${moment().format('DD MMMM YYYY')}`;

export const BATCHLOADER_USERNAME = 'batchloader';
export const BATCHLOADER = {
    username: BATCHLOADER_USERNAME,
    roles: ['AttachmentReviewer']
};

export const created = TODAY;
export const imported = TODAY;

export function removeWhite(text: string) {
    if (!text) {
        return '';
    } else {
        return text.replace(/\s+/g, ' ');
    }
}

export function sanitizeText(s: string) {
    return s.replace(/:/g, '').replace(/\./g, '').trim();
}

export function wipeBeforeCompare(obj: any) {
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
    delete obj.sources;

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

export function trimWhite(text: string) {
    if (!text) {
        return '';
    } else {
        return text.replace(/\s+/g, ' ').trim();
    }
}

export function printUpdateResult(updateResult: any, elt: any) {
    if (updateResult.nModified) {
        console.log(`${updateResult.nModified} ${elt.elementType} Raw Artifact modified: ${elt.tinyId}`);
    }
    if (updateResult.upserted && updateResult.upserted.length) {
        console.log(`${updateResult.upserted.length} ${elt.elementType} Raw Artifact inserted: ${elt.tinyId}`);
    }
}

export function replaceClassificationByOrg(newClassification: Classification[], existingClassification: Classification[], orgName: string) {
    const otherClassifications = existingClassification.filter(c => c.stewardOrg.name !== orgName);
    return newClassification.concat(otherClassifications);
}

export function updateCde(elt: any, user: any, options = {}) {
    return new Promise((resolve, reject) => {
        mongo_cde.update(elt, user, options, (err, savedElt) => {
            if (err) {
                reject(err);
            } else {
                resolve(savedElt);
            }
        });
    });
}

export function updateForm(elt: any, user: any, options = {}) {
    return new Promise((resolve, reject) => {
        /*@TODO remove it after PhenX loader.
                const isPhenX = elt.ids.filter(id => id.source === 'PhenX').length > 0;
                const isQualified = elt.registrationState.registrationStatus === 'Qualified';
                const isArchived = elt.archived;
                if (isPhenX && isQualified && !isArchived) {
                    console.log(`Qualified PhenX Form cannot be updated through loader.`);
                    process.exit(1);
                }
        */
        mongo_form.update(elt, user, options, (err, savedElt) => {
            if (err) {
                reject(err);
            } else {
                resolve(savedElt);
            }
        });
    });
}

const DOMAIN_COLLECTION_MAP: any = {};

export function protocolLinkToProtocolId(href: string) {
    const indexString = '/protocols/view/';
    const protocolIdIndex = href.indexOf(indexString);
    return href.substr(protocolIdIndex + indexString.length, href.length);
}

export function getDomainCollection() {
    return new Promise((resolve, reject) => {
        if (!isEmpty(DOMAIN_COLLECTION_MAP)) {
            resolve(DOMAIN_COLLECTION_MAP);
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
                    DOMAIN_COLLECTION_MAP[protocolId] = {protocolLink, domainCollection};
                }
                resolve(DOMAIN_COLLECTION_MAP);
            });
        }
    });
}

function getChildren(formElements: FormElement[]) {
    let ids: any = [];
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
export function compareElt(newEltObj, existingEltObj) {
    if (newEltObj.elementType !== existingEltObj.elementType) {
        console.log(`Two element type different. newEltObj: ${newEltObj.tinyId} existingEltObj: ${existingEltObj.tinyId} `);
        process.exit(1);
    }
    const isQualified = existingEltObj.registrationState.registrationStatus === 'Qualified';
    [existingEltObj, newEltObj].forEach(eltObj => {
        eltObj.designations.sort((a, b) => a.designation >= b.designation);
        eltObj.definitions.sort((a, b) => a.definition >= b.definition);

        eltObj.properties.sort((a, b) => a.key >= b.key);
        eltObj.referenceDocuments.sort((a, b) => a.docType >= b.docType);
        eltObj.ids.sort((a, b) => a.source >= b.source);
        ['designations', 'definitions', 'properties', 'referenceDocuments', 'ids']
            .forEach(field => {
                eltObj[field].forEach(o => {
                    delete o.sources;
                    delete o.source;
                });
            });

        if (eltObj.elementType === 'form' && !isQualified) {
            eltObj.cdeIds = getChildren(eltObj.formElements);
        }

        wipeBeforeCompare(eltObj);

    });
    const result = DiffJson.diff(existingEltObj, newEltObj);
    return result;
}

// Merge two elements
function mergeDesignation(existingDesignations: Designation[], newDesignations: Designation[]) {
    const designations: Designation[] = [];
    allDesignations.forEach(designation => {
        const i = findIndex(designations, {designation: designation.designation});
        if (i !== -1) {
            const allTags = designations[i].tags.concat(designation.tags);
            designations[i].tags = uniq(allTags).filter(t => !isEmpty(t));
        } else {
            designations.push(designation);
        }

    });
    return designations;
}

function mergeDefinition(existingDefinitions: Definition[], newDefinitions: Definition[]) {
    const definitions: Definition[] = [];
    const allDefinitions = existingDefinitions.concat(newDefinitions);
    allDefinitions.forEach(definition => {
        const i = findIndex(definitions, {definition: definition.definition});
        if (i !== -1) {
            const allTags = definitions[i].tags.concat(definition.tags);
            definitions[i].tags = uniq(allTags).filter(t => !isEmpty(t));
        } else {
            definitions.push(definition);
        }
    });
    return definitions;
}

export function mergeProperties(newProperties, existingProperties) {
    const properties = [];
    const allProperties = newProperties.concat(existingProperties);
    allProperties.forEach(property => {
        const i = findIndex(properties, {key: property.key});
        if (i === -1) {
            properties.push(property);
        }
    });
    return properties;
}

export function mergeBySources(newSources, existingSources, sources) {
    if (!existingSources) {
        existingSources = [];
    }
    const otherSources = existingSources.filter(o => sources.indexOf(o.source) === -1);
    return newSources.concat(otherSources);
}

export function mergeSourcesBySourcesName(newSources, existingSources, sources) {
    const otherSources = existingSources.filter(o => sources.indexOf(o.sourceName) === -1);
    return newSources.concat(otherSources);
}

export function mergeElt(existingEltObj: any, newEltObj: any, source: string) {
    if (newEltObj.elementType !== existingEltObj.elementType) {
        console.log(`Two element type different. newEltObj: ${newEltObj.tinyId} existingEltObj: ${existingEltObj.tinyId} `);
        process.exit(1);
    }
    const upperCaseSource = source.toUpperCase();
    const sources = sourceMap[upperCaseSource]; // ['PhenX', 'PhenX Variable']
    existingEltObj.designations = mergeDesignation(existingEltObj.designations, newEltObj.designations);
    existingEltObj.definitions = mergeDefinition(existingEltObj.definitions, newEltObj.definitions);

    existingEltObj.ids = mergeBySources(newEltObj.ids, existingEltObj.ids, sources);
    existingEltObj.properties = mergeProperties(newEltObj.properties, existingEltObj.properties);
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

