import { isEmpty, isEqual, toLower, trim } from 'lodash';
import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported } from 'ingester/shared/utility';
import { QuestionTypeNumber, QuestionTypeText } from 'shared/de/dataElement.model';
import { get } from 'request';
import * as cheerio from 'cheerio';

const UOM_MAP = {
    '': '',
    Centimeter: 'cm',
    Day: 'd',
    Gram: 'g',
    Minute: 'min',
    Percentage: '%',
    minute: 'min',
    second: 's',
    centimeter: 'cm',
    lx: 'lx',
    Hour: 'h',
    Millimeter: 'mm',
    'Degree Celsius': 'Cel',
    milligram: 'mg',
    Decibel: 'cB',
    milliAmpere: 'mA',
    hours: 'h',
    hour: 'h',
    percentage: '%',
    Newton: 'N',
    day: 'd',
    gram: 'g',
    mm: 'mm',
    cm: 'cm',
    percent: '%',
    days: 'd',
    minutes: 'min',
    'hour:minutes': 'h:m',
    'cm/s': 'cm/s',
    s: 's',
    Second: 's',
    mA: 'mA',
    Hz: 'Hz',
    ms: 'ms',
    Minutes: 'min',
    Seconds: 's',
    Meter: 'm',
    millimeters: 'mm',
    centimeters: 'cm',
    'hh:mm': 'h:m',
    'RPM/s': 'RPM/s',
    RPM: 'RPM',
    Month: 'mo',
    'Centimeter per second': 'cm/s',
    kHz: 'kHz',
    dB: 'dB',
    Celcius: 'Cel',
    integer: 'integer',
    count: 'count',
    Degree: 'Degree',
};

const DATA_TYPE_MAP = {
    '': 'Text',
    Alphanumeric: 'Text',
    'Date or Date & Time': 'Date',
    'Numeric Values': 'Number',
    Numeric: 'Number',
    'numeric Values': 'Number',
    'Numeric values': 'Number',
    Time: 'Text',
    alphanumeric: 'Text'
};

export function getCell(row, header) {
    if (!isEmpty(row[header])) {
        return trim(row[header]);
    } else {
        const headerLower = toLower(header);
        if (!isEmpty(row[headerLower])) {
            return trim(row[headerLower]);
        } else {
            return '';
        }
    }
}

function parseDesignations(row) {
    const designations = [];
    const title = getCell(row, 'Title');
    const preferredQuestionText = getCell(row, 'Preferred Question Text');

    if (isEqual(title, preferredQuestionText)) {
        designations.push({
            designation: title,
            tags: ['Preferred Question Text']
        });
    } else {
        designations.push({
            designation: title,
            tags: []
        });
        designations.push({
            designation: preferredQuestionText,
            tags: ['Preferred Question Text']
        });
    }
    return designations;
}

function parseDefinitions(row) {
    const definitions = [];
    const shortDescription = getCell(row, 'Short Description');
    const description = getCell(row, 'Definition');
    if (isEqual(shortDescription, description)) {
        definitions.push({
            definition: description,
            tags: []
        });
    } else {
        definitions.push({
            definition: description,
            tags: []
        });
        definitions.push({
            definition: shortDescription,
            tags: []
        });
    }
    return definitions;
}

function parseValueDomain(row) {
    const unitOfMeasure = getCell(row, 'Unit of Measure');
    const uom = UOM_MAP[unitOfMeasure];
    if (isEmpty(uom)) {
        console.log(`${unitOfMeasure} is not in the uom map.`);
        process.exit(1);
    }
    const valueDomain = {
        datatype: 'Text',
        uom,
        permissibleValues: []
    };

    const inputRestrictionString = getCell(row, 'Input Restriction').toLowerCase();

    const valueListInputRestriction = ['single pre-defined value selected', 'multiple pre-defined values selected'];
    if (valueListInputRestriction.indexOf(inputRestrictionString) !== -1) {
        valueDomain.datatype = 'Value List';
        const permissibleValueString = getCell(row, 'Permissible Values');
        const permissibleValueOutputCodes = getCell(row, 'Permissible Value Output Codes');
        if (permissibleValueString) {
            const permissibleValueArray = permissibleValueString.split(';').filter(t => t);
            const pvCodes = permissibleValueOutputCodes.split(';').filter(t => t);
            permissibleValueArray.forEach((pv, i) => {
                const permissibleValue = {
                    permissibleValue: pvCodes[i] ? pvCodes[i] : pv,
                    valueMeaningName: pv
                };
                valueDomain.permissibleValues.push(permissibleValue);
            });
        } else {
            console.log('bad pvs');
            process.exit(1);
        }
    } else if (inputRestrictionString === 'free-form entry') {
        const datatypeString = getCell(row, 'datatype');
        const datatype = DATA_TYPE_MAP[datatypeString];

        if (isEmpty(datatype)) {
            console.log(`${datatypeString} is not in data type map.`);
            process.exit(1);
        }

        if (datatype === 'Text') {
            valueDomain.datatype = 'Text';
            const datatypeText: QuestionTypeText = {};
            const maximumCharacterQuantity = getCell(row, 'Maximum Character Quantity');
            if (!isEmpty(maximumCharacterQuantity)) {
                datatypeText.maxLength = parseInt(maximumCharacterQuantity);
            }
            if (!isEmpty(datatypeText)) {
                valueDomain.datatypeText = datatypeText;
            }
        }
        if (datatype === 'Number') {
            valueDomain.datatype = 'Number';
            const datatypeNumber: QuestionTypeNumber = {};
            const minimumValue = getCell(row, 'Minimum Value');
            if (!isEmpty(minimumValue)) {
                datatypeNumber.minValue = parseInt(minimumValue);
            }
            const maximumValue = getCell(row, 'Maximum Value');
            if (!isEmpty(maximumValue)) {
                datatypeNumber.maxValue = parseInt(maximumValue);
            }
            if (!isEmpty(datatypeNumber)) {
                valueDomain.datatypeNumber = datatypeNumber;
            }
        }
    } else {
        console.log('bad input restriction');
        process.exit(1);
    }

    return valueDomain;
}

const UNPARSED_REF_DOC = new Set();

function fetchPubmedRef(pmId) {
    return new Promise((resolve, reject) => {
        const pubmedUrl = 'https://www.ncbi.nlm.nih.gov/pubmed/?term=';
        const uri = pubmedUrl + pmId.trim();
        get(uri, (err, response, body) => {
            if (err) {
                console.log(err);
                process.exit(1);
            } else if (response.statusCode === 200) {
                const $ = cheerio.load(body);
                const title = $('.rprt_all h1').text();
                const abstracttext = $('abstracttext').text();
                resolve({title, uri, text: abstracttext});
            } else {
                console.log('status: ' + response.statusCode);
                process.exit(1);
            }
        });
    });
}

export function parseReferenceDocuments(row) {
    const EXCLUDE_REF_DOC = [
        'No references available',
        'Please fill out'
    ];
    const referenceDocuments = [];
    return new Promise(async (resolve, reject) => {
        let referencesString = getCell(row, 'References');
        EXCLUDE_REF_DOC.forEach(excludeRefDoc => referencesString = referencesString.replace(excludeRefDoc, '').trim());
        if (referencesString) {
            const regex = /\s*(PMID|PUBMED|pubmed\/)(:|,|\s)*(\s*\d*[.|,|\s]*)*/ig;
            const pmIdArray = referencesString.match(regex);
            if (pmIdArray) {
                for (const pmIdString of pmIdArray) {
                    const pmIds = pmIdString
                        .replace(/PMID:/ig, '')
                        .replace(/\./ig, '')
                        .replace(/pubmed\//ig, '')
                        .replace(/PMID/ig, '')
                        .trim().split(',').filter(p => !isEmpty(p));
                    for (const pmId of pmIds) {
                        const pubmedRef = await fetchPubmedRef(pmId);
                        referenceDocuments.push({
                            docType: 'text',
                            title: pubmedRef.title
                            uri: pubmedRef.uri,
                            source: 'PubMed',
                            languageCode: 'en-us',
                            document: pubmedRef.abstracttext
                        });
                    }
                }
            } else {
                UNPARSED_REF_DOC.add(referencesString);
                referenceDocuments.push({
                    document: referencesString
                });
            }
        }
        resolve(referenceDocuments);
    });
}

function parseProperties(row) {
    const properties = [];
    const keywords = getCell(row, 'Keywords');
    if (!isEmpty(keywords)) {
        properties.push({key: 'Keywords', value: keywords, source: 'NINDS'});
    }
    const guidelinesInstructions = getCell(row, 'Guidelines/Instructions');
    if (!isEmpty(guidelinesInstructions)) {
        properties.push({key: 'Guidelines/Instructions', value: guidelinesInstructions, source: 'NINDS'});
    }
    const notes = getCell(row, 'Notes');
    if (!isEmpty(notes)) {
        properties.push({key: 'Notes', value: notes, source: 'NINDS'});
    }

    return properties;
}

function parseIds(row) {
    const ids = [];
    const variableName = getCell(row, 'Variable Name');
    if (!isEmpty(variableName)) {
        ids.push({
            source: 'NINDS Preclinical',
            id: variableName,
            version: '1'
        });
    }
    return ids;
}

function parseClassification(row) {
    const classification = [{
        stewardOrg: {name: 'NINDS'},
        elements: [{
            name: 'Preclinical TBI',
            elements: []
        }]
    }];
    const taxonomyString = getCell(row, 'Taxonomy');
    if (!isEmpty(taxonomyString)) {
        const taxonomyArray = taxonomyString.split(';').filter(t => t);
        if (taxonomyArray.length > 0) {
            classification[0].elements[0].elements.push({name: 'Taxonomy', elements: []});
        }
        taxonomyArray.forEach(t => {
            classification[0].elements[0].elements[0].elements.push({name: t, elements: []});
        });
    }
    return classification;
}

export async function createNindsCde(row) {
    const ids = parseIds(row);
    const designations = parseDesignations(row);
    const definitions = parseDefinitions(row);
    const valueDomain = parseValueDomain(row);
    const referenceDocuments = await parseReferenceDocuments(row);
    const properties = parseProperties(row);
    const classification = parseClassification(row);
    const nindsCde = {
        tinyId: generateTinyId(),
        stewardOrg: {
            name: 'NINDS'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        createdBy: BATCHLOADER,
        created,
        imported,
        designations,
        definitions,
        valueDomain,
        referenceDocuments,
        properties,
        ids,
        classification
    };
    return nindsCde;
}
