import { Builder, By } from 'selenium-webdriver';
import * as DiffJson from 'diff-json';
import * as moment from 'moment';
import {
    find,
    findIndex,
    includes,
    isEmpty,
    isEqual,
    lastIndexOf,
    lowerCase,
    noop,
    sortBy,
    trim,
    uniq,
    uniqBy,
    uniqWith,
    words,
} from 'lodash';
import { words as wordCapitalize } from 'capitalize';
import * as mongo_cde from 'server/cde/mongo-cde';
import { dataElementModel, dataElementSourceModel } from 'server/cde/mongo-cde';
import * as mongo_form from 'server/form/mongo-form';
import { formModel, formSourceModel } from 'server/form/mongo-form';
import {
    Attachment,
    CdeId,
    Classification,
    Definition,
    Designation,
    Item,
    Property,
    ReferenceDocument,
} from 'shared/models.model';
import { CdeForm, FormElement } from 'shared/form/form.model';
import { addFile } from 'server/mongo/mongo/gfs';
import { idComparator, referenceDocumentComparator } from 'shared/elt/comparator';
import { Readable } from 'stream';

require('chromedriver');

export const NINDS_PRECLINICAL_NEI_FILE_PATH = 'S:/MLB/CDE/NINDS/Preclinical + NEI/10-7-2019/';

export const sourceMap: any = {
    LOINC: ['LOINC'],
    PhenX: ['PhenX', 'PhenX Variable'],
    NINDS: ['NINDS', 'NINDS Variable Name', 'NINDS caDSR', 'NINDS Preclinical', 'BRICS Variable Name'],
    // tslint:disable-next-line:max-line-length
    'NINDS Preclinical TBI': [
        'NINDS',
        'NINDS Variable Name',
        'NINDS caDSR',
        'NINDS Preclinical',
        'BRICS Variable Name',
        'NINDS Preclinical TBI',
    ],
    NCI: ['NCI', 'caDSR'],
    NICHD: ['NICHD'],
    NINR: [
        'NINDS',
        'NINDS Variable Name',
        'NINDS caDSR',
        'NINDS Preclinical',
        'BRICS Variable Name',
        'NINDS Preclinical TBI',
    ],
};
export const TODAY = new Date().toJSON();
export const lastMigrationScript = `load NHLBI on ${moment().format('DD MMMM YYYY')}`;

export const BATCHLOADER_USERNAME = 'NIH CDE Repository Team';
export const BATCHLOADER = {
    username: BATCHLOADER_USERNAME,
    roles: [],
};

export const created = TODAY;
export const imported = TODAY;
export const version = '1.0';

export const NINR_SOCIAL_DETERMINANTS_OF_HEALTH = 'NINR Social Determinants of Health';

export function sanitizeText(s: string) {
    return s.replace(/:/g, '').replace(/\./g, '').trim();
}

export function replaceDashAndCapitalize(s: string) {
    const sArray = words(s.replace(/_/g, ' ')).join(' ');
    const formattedS = wordCapitalize(sArray);
    return formattedS;
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
    delete obj.version;
    delete obj.dataSets;
    delete obj.lastMigrationScript;
    delete obj.registrationState;

    delete obj.imported;
    delete obj.stewardOrg;
    delete obj.created;
    delete obj.createdBy;
    delete obj.updated;
    delete obj.updatedBy;
    delete obj.sources;
    delete obj.sourcesNew;

    delete obj.naming;
    delete obj.displayProfiles;
    delete obj.history;
    delete obj.classification;
    delete obj.attachments;
    delete obj.derivationRules;
    delete obj.comments;

    if (obj.valueDomain) {
        if (isEmpty(obj.valueDomain.uom)) {
            delete obj.valueDomain.uom;
        }
        if (isEmpty(obj.valueDomain.datatypeText)) {
            delete obj.valueDomain.datatypeText;
        }
        if (isEmpty(obj.valueDomain.datatypeNumber)) {
            delete obj.valueDomain.datatypeNumber;
        }
        if (isEmpty(obj.valueDomain.datatypeDate)) {
            delete obj.valueDomain.datatypeDate;
        }
        delete obj.valueDomain.datatypeTime;
        delete obj.valueDomain.datatypeValueList;
    }

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

export async function updateRawArtifact(
    existingElt: Item,
    newElt: CdeForm,
    source: string,
    classificationOrgName: string
) {
    if (!existingElt || !newElt) {
        return;
    }
    delete newElt.tinyId;
    delete newElt._id;
    newElt.classification = existingElt.classification.filter(c => c.stewardOrg.name === classificationOrgName);
    let mongooseModel: any = dataElementSourceModel;
    if (existingElt.elementType === 'form') {
        mongooseModel = formSourceModel;
    }
    newElt.source = source;
    const updateResult = await mongooseModel.updateOne(
        {
            tinyId: existingElt.tinyId,
            source,
        },
        newElt,
        { upsert: true }
    );
    printUpdateResult(updateResult, existingElt);
}

export function printUpdateResult(updateResult: any, elt: any) {
    if (updateResult.nModified) {
        console.log(`${updateResult.nModified} ${elt.elementType} Raw Artifact modified: ${elt.tinyId}`);
    }
    if (updateResult.upserted && updateResult.upserted.length) {
        console.log(`${updateResult.upserted.length} ${elt.elementType} Raw Artifact inserted: ${elt.tinyId}`);
    }
}

export function replaceClassificationByOrg(existingObj: CdeForm, newObj: CdeForm, orgName: string) {
    const otherClassifications = existingObj.classification.filter(c => c.stewardOrg.name !== orgName);
    const currentClassification = newObj.classification.filter(c => c.stewardOrg.name === orgName);
    return currentClassification.concat(otherClassifications);
}

function mergeElements(existingElements, newElements) {
    newElements.forEach(e => {
        const foundElement = find(existingElements, o => o.name === e.name);
        if (!foundElement) {
            existingElements.unshift(e);
        } else {
            mergeElements(foundElement.elements, e.elements);
        }
    });
}

export function mergeClassificationByOrg(
    existingObj: {
        classification: Classification[];
    },
    newObj: CdeForm,
    orgName: string = ''
) {
    const newClassification = newObj.classification;
    const existingClassification = existingObj.classification;
    newClassification
        .filter(c => {
            if (orgName) {
                return c.stewardOrg.name === orgName;
            } else {
                return true;
            }
        })
        .forEach(c => {
            const foundClassification: Classification | undefined = find(
                existingClassification,
                o => o.stewardOrg.name === c.stewardOrg.name
            );
            if (!foundClassification) {
                existingObj.classification.unshift(c);
            } else {
                const existingElements = foundClassification.elements;
                const newElements = c.elements;
                mergeElements(existingElements, newElements);
            }
        });
}

export async function createCde(cde: any) {
    if (cde.classification.length === 0) {
        cde.classification.push({
            stewardOrg: { name: 'TEXT' },
            elements: [
                {
                    name: 'non-classified',
                    elements: [],
                },
            ],
        });
    }
    await new dataElementModel(cde).save();
}

export async function createForm(form: any) {
    if (form.classification.length === 0) {
        form.classification.push({
            stewardOrg: { name: 'TEXT' },
            elements: [
                {
                    name: 'non-classified',
                    elements: [],
                },
            ],
        });
    }
    await new formModel(form).save();
}

export function updateCde(elt: any, user: any = BATCHLOADER, options = {}) {
    fixElt(elt);
    elt.lastMigrationScript = lastMigrationScript;
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

export async function updateForm(elt: any, user: any, options: any = {}) {
    fixElt(elt);
    elt.lastMigrationScript = lastMigrationScript;
    return new Promise((resolve, reject) => {
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

export async function getDomainCollectionSite() {
    if (!isEmpty(DOMAIN_COLLECTION_MAP)) {
        return DOMAIN_COLLECTION_MAP;
    }
    const driver = await new Builder().forBrowser('chrome').build();
    await driver.get(PhenxURL);
    await driver.findElement(By.xpath("//*[@class='close btn-cookie-agree']")).click();

    const totalPageElement = await driver.findElement(By.xpath("(//*[@id='myTable_paginate']/span/a)[last()]"));
    const totalPageText = await totalPageElement.getText();
    const totalPage = parseInt(totalPageText.trim(), 10);
    let currentPage = 1;
    while (currentPage < totalPage) {
        const currentPageElementXpath = "//*[@id='myTable_paginate']/span/a[@class='paginate_button current']";
        const currentPageElement = await driver.findElement(By.xpath(currentPageElementXpath));
        const currentPageText = await currentPageElement.getText();
        currentPage = parseInt(currentPageText.trim(), 10);
        const trs = await driver.findElements(By.xpath("//*[@id='myTable']/tbody/tr"));
        for (const tr of trs) {
            const tds = await tr.findElements(By.xpath('./td'));
            if (tds.length !== 3) {
                throw new Error('td length error.');
            }
            const a = await tds[1].findElement(By.xpath('.//a'));
            const href = await a.getAttribute('href');
            const phenXProtocol = await a.getText();
            const domainCollection = await tds[2].getText();
            const protocolId = protocolLinkToProtocolId(href);
            DOMAIN_COLLECTION_MAP[protocolId] = {
                phenXProtocol,
                protocolLink: href,
                domainCollection: domainCollection.trim(),
            };
        }
        await driver.findElement(By.id('myTable_next')).click();
        console.log('currentPage: ' + currentPage);
    }
    await driver.close();
    return DOMAIN_COLLECTION_MAP;
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
                    version: formElement.question.cde.version,
                });
            }
        });
    }
    return ids;
}

export function loopFormElements(
    formElements: FormElement[],
    options: any = {
        onQuestion: noop,
        onSection: noop,
        onForm: noop,
    }
) {
    if (formElements) {
        formElements.forEach(formElement => {
            if (formElement.elementType === 'question') {
                loopFormElements(formElement.formElements, options.onSection(formElement));
            } else if (formElement.elementType === 'section') {
                loopFormElements(formElement.formElements, options.onForm(formElement));
            } else if (formElement.elementType === 'form') {
                loopFormElements(formElement.formElements, options.onQuestion(formElement));
            }
        });
    }
}

// Compare two elements
export function compareElt(newEltObj: CdeForm, existingEltObj: CdeForm, source: string) {
    if (newEltObj.elementType !== existingEltObj.elementType) {
        console.log(
            `Two element type different. newEltObj: ${newEltObj.tinyId} existingEltObj: ${existingEltObj.tinyId} `
        );
        process.exit(1);
    }

    const isPhenX = existingEltObj.ids.filter(id => id.source === 'PhenX').length > 0;
    const isQualified = existingEltObj.registrationState.registrationStatus === 'Qualified';
    const isArchived = existingEltObj.archived;
    const isForm = existingEltObj.elementType === 'form';

    // PhenX Qualified form not need to compare formElements
    if (isForm && isPhenX && isQualified && !isArchived) {
        delete existingEltObj.formElements;
        delete newEltObj.formElements;
    }

    [existingEltObj, newEltObj].forEach((eltObj: any) => {
        eltObj.designations = sortBy(eltObj.designations, ['designation']);
        eltObj.definitions = sortBy(eltObj.definitions, ['definition']);

        eltObj.properties = sortBy(eltObj.properties, ['key']);
        eltObj.referenceDocuments = sortBy(eltObj.referenceDocuments, ['docType', 'languageCode', 'document']);

        eltObj.ids = sortBy(
            eltObj.ids.filter(id => sourceMap[source].indexOf(id.source) !== -1),
            ['source', 'id']
        );
        ['designations', 'definitions', 'properties', 'referenceDocuments', 'ids'].forEach(field => {
            eltObj[field].forEach(o => {
                delete o.sources;
                delete o.source;
            });
        });

        if (isForm) {
            eltObj.cdeTinyIds = getChildren(eltObj.formElements);
        }
        wipeBeforeCompare(eltObj);

        // Classification changes don't trigger version changes.
        delete eltObj.classification;
    });

    return DiffJson.diff(existingEltObj, newEltObj);
}

// Merge two elements
function isOneClassificationSameSource(existingEltObj: CdeForm, newEltObj: CdeForm) {
    const existingObjClassificationSize = existingEltObj.classification.length;
    const newEltObjClassificationSize = newEltObj.classification.length;
    const existingObjSources = existingEltObj.sources.length;
    const newEltObjSources = newEltObj.sources.length;
    const classificationEqual = existingObjClassificationSize && newEltObjClassificationSize;
    const sourcesEqual = existingObjSources && newEltObjSources;
    return classificationEqual && sourcesEqual;
}

export function mergeDesignations(existingObj: CdeForm, newObj: CdeForm) {
    const replaceDesignations = isOneClassificationSameSource(existingObj, newObj);
    if (replaceDesignations) {
        existingObj.designations = newObj.designations;
    } else {
        const existingDesignations: Designation[] = existingObj.designations;
        const newDesignations: Designation[] = newObj.designations;
        newDesignations.forEach(newDesignation => {
            const foundDesignation: Designation | undefined = find(existingDesignations, {
                designation: newDesignation.designation,
            });
            if (!foundDesignation) {
                existingDesignations.push(newDesignation);
            } else {
                const allTags = foundDesignation.tags.concat(newDesignation.tags);
                foundDesignation.tags = uniq(allTags).filter(t => !isEmpty(t));
            }
        });
    }
    existingObj.designations = sortDesignations(existingObj.designations);
}

export function mergeDefinitions(existingObj: CdeForm, newObj: CdeForm) {
    const replaceDefinitions = isOneClassificationSameSource(existingObj, newObj);
    if (replaceDefinitions) {
        existingObj.definitions = newObj.definitions;
    } else {
        const existingDefinitions: Definition[] = existingObj.definitions;
        const newDefinitions: Definition[] = newObj.definitions;
        newDefinitions.forEach(newDefinition => {
            const foundDefinition: Definition | undefined = find(existingDefinitions, {
                definition: newDefinition.definition,
            });
            if (!foundDefinition) {
                existingDefinitions.push(newDefinition);
            } else {
                const allTags = foundDefinition.tags.concat(newDefinition.tags);
                foundDefinition.tags = uniq(allTags).filter(t => !isEmpty(t));
                foundDefinition.definitionFormat = newDefinition.definitionFormat;
            }
        });
    }
}

export function mergeProperties(existingObj: CdeForm, newObj: CdeForm) {
    const replaceProperties = isOneClassificationSameSource(existingObj, newObj);
    if (replaceProperties) {
        existingObj.properties = newObj.properties;
    } else {
        const existingProperties: Property[] = existingObj.properties;
        const newProperties: Property[] = newObj.properties;
        newProperties.forEach(newProperty => {
            const i = findIndex(existingProperties, o => {
                const keyWithS = o.key + 's';
                if (isEqual(lowerCase(o.key), lowerCase(newProperty.key))) {
                    return true;
                } else if (isEqual(lowerCase(keyWithS), lowerCase(newProperty.key))) {
                    // LOINC Participant => Participants
                    return true;
                } else {
                    return false;
                }
            });
            if (i === -1) {
                existingProperties.push(newProperty);
            } else {
                existingProperties[i] = newProperty;
            }
        });
    }
}

export function mergeReferenceDocuments(existingObj: CdeForm, newObj: CdeForm) {
    const replaceReferenceDocuments = isOneClassificationSameSource(existingObj, newObj);
    if (replaceReferenceDocuments) {
        existingObj.referenceDocuments = newObj.referenceDocuments;
    } else {
        const existingReferenceDocuments: ReferenceDocument[] = existingObj.referenceDocuments;
        const newReferenceDocuments: ReferenceDocument[] = newObj.referenceDocuments;

        newReferenceDocuments.forEach(newReferenceDocument => {
            const i = findIndex(
                existingReferenceDocuments,
                o =>
                    isEqual(o.docType, newReferenceDocument.docType) &&
                    isEqual(o.title, newReferenceDocument.title) &&
                    isEqual(o.providerOrg, newReferenceDocument.providerOrg) &&
                    isEqual(o.uri, newReferenceDocument.uri) &&
                    isEqual(o.languageCode, newReferenceDocument.languageCode) &&
                    isEqual(o.document, newReferenceDocument.document) &&
                    isEqual(o.source, newReferenceDocument.source)
            );
            if (i === -1) {
                existingReferenceDocuments.push(newReferenceDocument);
            } else {
                existingReferenceDocuments[i] = newReferenceDocument;
            }
        });
    }
}

export function mergeIds(existingObj: CdeForm, newObj: CdeForm, source: string) {
    const NINDS_SOURCES = [
        'NINDS Preclinical',
        'BRICS Variable Name',
        'NINDS Variable Name',
        'NINDS caDSR',
        'NINDS CDISC',
    ];

    const existingIds: CdeId[] = existingObj.ids;
    const newIds: CdeId[] = newObj.ids;
    newIds.forEach(newId => {
        const i = findIndex(existingIds, o => {
            if (NINDS_SOURCES.indexOf(o.source) !== -1 && NINDS_SOURCES.indexOf(newId.source) !== -1) {
                return true;
            } else {
                return isEqual(o.source, newId.source) && isEqual(o.id, newId.id);
            }
        });
        if (i === -1) {
            existingIds.push(newId);
        } else {
            existingIds[i] = newId;
        }
    });
    sortIds(existingObj.ids, source);
}

export function mergeSources(existingObj: CdeForm, newObj: CdeForm, source: string) {
    const sources = sourceMap[source];
    const existingSources = existingObj.sources;
    const newSources = newObj.sources;
    const otherSources = existingSources.filter(o => {
        const index = sources.indexOf(o.sourceName);
        return index === -1;
    });
    existingObj.sources = newSources.concat(otherSources);
}

function increaseVersion(existingEltObj: CdeForm) {
    const version = existingEltObj.version;
    if (version) {
        let majorVersion = version;
        let minorVersion = '0';
        const dotIndex = lastIndexOf(version, '.');
        if (dotIndex !== -1) {
            majorVersion = version.substr(0, dotIndex);
            minorVersion = version.substr(dotIndex + 1, version.length - 1);
        }
        const minorVersionNum = parseInt(minorVersion, 10);
        const increasedMinorVersion = minorVersionNum + 1;
        existingEltObj.version = majorVersion + '.' + increasedMinorVersion;
    } else {
        existingEltObj.version = '1.0';
    }
}

export function mergeElt(existingEltObj: any, newEltObj: any, source: string) {
    const isForm = existingEltObj.elementType === 'form';
    const isCde = existingEltObj.elementType === 'cde';

    const isPhenX = existingEltObj.ids.filter(id => id.source === 'PhenX').length > 0;
    const isQualified = existingEltObj.registrationState.registrationStatus === 'Qualified';
    const isArchived = existingEltObj.archived;

    existingEltObj.imported = imported;
    existingEltObj.lastMigrationScript = lastMigrationScript;
    existingEltObj.changeNote = lastMigrationScript;

    mergeDesignations(existingEltObj, newEltObj);
    mergeDefinitions(existingEltObj, newEltObj);

    mergeIds(existingEltObj, newEltObj, source);
    mergeProperties(existingEltObj, newEltObj);
    mergeReferenceDocuments(existingEltObj, newEltObj);

    //    mergeSources(existingEltObj, newEltObj, source);

    existingEltObj.attachments = newEltObj.attachments;
    if (existingEltObj.lastMigrationScript !== lastMigrationScript) {
        increaseVersion(existingEltObj);
    }

    if (isCde) {
        existingEltObj.property = newEltObj.property;
        existingEltObj.dataElementConcept = newEltObj.dataElementConcept;
        existingEltObj.objectClass = newEltObj.objectClass;
        existingEltObj.valueDomain = newEltObj.valueDomain;
    }

    if (isForm) {
        // EXCEPTIONS
        // Those 50 qualified phenx forms , loader skip form elements.
        if (isPhenX && !isArchived && isQualified) {
        } else {
            existingEltObj.formElements = newEltObj.formElements;
        }
    }

    if (isPhenX && !isArchived && isQualified) {
    } else {
        existingEltObj.registrationState.registrationStatus = newEltObj.registrationState.registrationStatus;
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

export function fixValueDomainOrQuestion(valueDomainOrQuestion) {
    const datatype = valueDomainOrQuestion.datatype;
    if (datatype === 'Text') {
        if (!isEmpty(datatype.datatypeText)) {
            valueDomainOrQuestion.datatypeText = fixDatatypeText(valueDomainOrQuestion.datatypeText);
        } else {
            delete valueDomainOrQuestion.datatypeText;
        }
    }

    if (datatype === 'Number') {
        if (!isEmpty(datatype.datatypeNumber)) {
            valueDomainOrQuestion.datatypeNumber = fixDatatypeNumber(valueDomainOrQuestion.datatypeNumber);
        } else {
            delete valueDomainOrQuestion.datatypeNumber;
        }
    }

    if (datatype === 'Date') {
        if (!isEmpty(datatype.datatypeDate)) {
            valueDomainOrQuestion.datatypeDate = fixDatatypeDate(valueDomainOrQuestion.datatypeDate);
        } else {
            delete valueDomainOrQuestion.datatypeDate;
        }
    }

    if (datatype === 'Time' && !isEmpty(datatype.datatypeTime)) {
        valueDomainOrQuestion.datatypeTime = fixDatatypeTime(valueDomainOrQuestion.datatypeTime);
    }

    if (datatype === 'Dynamic Code List' && !isEmpty(datatype.datatypeDynamicCodeList)) {
        valueDomainOrQuestion.datatypeDynamicCodeList = fixDatatypeDynamicCodeList(
            valueDomainOrQuestion.datatypeDynamicCodeList
        );
    }

    if (datatype === 'Value List' && !isEmpty(datatype.datatypeValueList)) {
        valueDomainOrQuestion.datatypeValueList = fixDatatypeValueList(valueDomainOrQuestion.datatypeValueList);
    }

    if (datatype === 'Externally Defined' && !isEmpty(datatype.datatypeExternallyDefined)) {
        valueDomainOrQuestion.datatypeExternallyDefined = fixDatatypeExternallyDefined(
            valueDomainOrQuestion.datatypeExternallyDefined
        );
    }
}

export function sortProp(elt: CdeForm) {
    return sortBy(elt.properties, 'key');
}

export function sortRefDoc(elt: CdeForm) {
    elt.referenceDocuments.forEach(r => {
        r.languageCode = 'en-us';
    });
    return sortBy(elt.referenceDocuments, ['docType', 'languageCode', 'document']);
}

export function addAttachment(readable: Readable, attachment: Attachment): Promise<void> {
    return addFile(
        {
            filename: attachment.filename,
            stream: readable,
        },
        {
            contentType: attachment.filetype,
            metadata: {
                status: 'approved',
            },
        }
    ).then(fileId => {
        attachment.fileid = fileId.toString();
    });
}

// Utility methods related to cde and form
export function sortReferenceDocuments(referenceDocuments: any[]) {
    return sortBy(referenceDocuments, ['title', 'uri']);
}

export function sortProperties(properties: any[]) {
    return sortBy(properties, ['key']);
}

export function sortDesignations(designations: any[]) {
    const noTagDesignations = designations.filter(d => isEmpty(d.tags));
    const tagDesignations = designations.filter(d => !isEmpty(d.tags));
    const sortNoTagDesignations = sortBy(noTagDesignations, ['designation']);
    const sortTagDesignations = sortBy(tagDesignations, ['designation']);
    return sortNoTagDesignations.concat(sortTagDesignations);
}

export function sortIds(ids: any, source: string) {
    const otherSourceIdentifiers = ids.filter(d => d.source !== source);
    const sourceIdentifiers = ids.filter(d => d.source === source);
    const sortOtherSourceIdentifiers = sortBy(otherSourceIdentifiers, ['id']);
    const sortSourceIdentifiers = sortBy(sourceIdentifiers, ['id']);

    return sortSourceIdentifiers.concat(sortOtherSourceIdentifiers);
}

export function findOneCde(cdes: any[]) {
    const cdesLength = cdes.length;
    if (cdesLength === 0) {
        return null;
    } else if (cdesLength === 1) {
        return cdes[0];
    } else {
        throw new Error(`Multiple cdes found. variableName: ${cdes[0].tinyId}`);
    }
}

export function findOneForm(forms: any[]) {
    const formsLength = forms.length;
    if (formsLength === 0) {
        return null;
    } else if (formsLength === 1) {
        return forms[0];
    } else {
        throw new Error(`Multiple forms found. TinyIds: ${forms[0].tinyId}`);
    }
}

export function retiredElt(elt: any) {
    elt.registrationState.registrationStatus = 'Retired';
    elt.registrationState.administrativeNote = 'Not present in import at ' + imported;
}

export async function formRawArtifact(tinyId: string, sourceName: string) {
    return formSourceModel.findOne({ tinyId, source: sourceName }).lean();
}

export function fixProperties(formObj: CdeForm) {
    return formObj.properties.filter(p => !isEmpty(p.value));
}

export function fixCreated(elt: CdeForm) {
    const defaultDate = new Date();
    defaultDate.setFullYear(1969, 1, 1);
    elt.created = defaultDate;
}

export function fixCreatedBy(elt: CdeForm) {
    elt.createdBy = {
        username: BATCHLOADER_USERNAME,
    };
}

export function fixSources(obj: CdeForm) {
    obj.sources.forEach(s => {
        if (s.sourceName === 'NINDS Preclinical NEI') {
            s.sourceName = 'NINDS Preclinical TBI';
        }
    });
    return obj.sources.filter(s => !isEmpty(s));
}

export function fixEmptyDesignation(cdeObj: CdeForm) {
    return cdeObj.designations.filter(d => d.designation);
}

export function fixEmptyDefinition(cdeObj: CdeForm) {
    return cdeObj.definitions.filter(d => d.definition);
}

export function fixClassification(eltObj: CdeForm) {
    eltObj.classification.forEach((c: any) => {
        if (c.stewardOrg.name.toLowerCase() === 'eyegene') {
            c.stewardOrg.name = 'eyeGENE';
        }
    });
    eltObj.classification = eltObj.classification.filter(c => !isEmpty(c.elements));
    return uniqBy(eltObj.classification, 'stewardOrg.name');
}

export function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export const EXCLUDE_REF_DOC = ['No references available', 'Please fill out', 'SCKLCELL:'];

function fixReferenceDocuments(elt: any) {
    elt.referenceDocuments = elt.referenceDocuments.filter((rd: ReferenceDocument) => {
        const document = trim(rd.document);
        const title = trim(rd.title);

        const excludeReferenceDocument = includes(EXCLUDE_REF_DOC, document);
        const emptyTitleDocument = isEmpty(document) && isEmpty(title);
        return !excludeReferenceDocument && !emptyTitleDocument;
    });
    elt.referenceDocuments = uniqWith(elt.referenceDocuments, referenceDocumentComparator);
    elt.referenceDocuments = sortReferenceDocuments(elt.referenceDocuments);
}

function fixIds(elt: any) {
    elt.ids = uniqWith(elt.ids, idComparator);
    elt.ids = sortIds(elt.ids, idComparator);
}

function fixElt(elt: CdeForm) {
    fixReferenceDocuments(elt);
    fixIds(elt);
}
