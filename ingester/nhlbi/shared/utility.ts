import { find, isEmpty, trim, uniq } from 'lodash';
import { Definition, Designation } from 'shared/models.model';

const DEFAULT_NHLBI_REGISTRATION_STATUS = 'Qualified';
const DEFAULT_NHLBI_CLASSIFICATION_ORG_NAME = 'NHLBI';
const DEFAULT_NHLBI_CLASSIFICATION_ARRAY: string[] = ['Subject', 'Topic', 'Subtopic'];
const DEFAULT_NHLBI_STEWARD_ORG_NAME = 'NHLBI';
const DEFAULT_NHLBI_SOURCE = 'ISTH ID';

export class NhlbiConfig {
    registrationStatus = DEFAULT_NHLBI_REGISTRATION_STATUS;
    classificationOrgName = DEFAULT_NHLBI_CLASSIFICATION_ORG_NAME;
    classificationArray: string[] = DEFAULT_NHLBI_CLASSIFICATION_ARRAY;
    source = DEFAULT_NHLBI_SOURCE;
    stewardOrg = DEFAULT_NHLBI_STEWARD_ORG_NAME;
}

export const DEFAULT_NHLBI_CONFIG = new NhlbiConfig();

export function formatRows(csvFileName: string, rows: any[]) {
    const formattedRows: any[] = [];
    rows.forEach((row, i) => {
        const formattedRow: any = {};
        for (const p in row) {
            if (row.hasOwnProperty(p)) {
                const formattedP = formatKey(p);
                if (!isEmpty(formattedP)) {
                    formattedRow[formattedP] = trim(row[p]);
                }
            }
        }
        let variableName = getCell(formattedRow, 'variable name');
        const name = getCell(formattedRow, 'Data Element Name');
        if (name) {
            variableName = name;
        }
        const isthID = getCell(formattedRow, 'ISTH ID');
        if (isEmpty(variableName)) {
            console.log(`${csvFileName} has empty Data Element Name. row: ${i}`);
            process.exit(1);
        }
        if (isEmpty(isthID)) {
            console.log(`${csvFileName} has empty ISTH ID. row: ${i}`);
            process.exit(1);
        }
        formattedRows.push(formattedRow);
    });
    return formattedRows;
}

export function getCell(row: any, header: string) {
    const key = formatKey(header);
    const value = row[key];
    if (!isEmpty(value)) {
        return trim(value);
    } else {
        return '';
    }
}

function formatKey(key: string) {
    const mappedKey = NHLBI_CSV_HEADER_MAP[key];
    if (!mappedKey) {
        return trim(key.toLowerCase());
    } else {
        return trim(mappedKey.toLowerCase());
    }
}

export function mergeDesignations(existingEltObj: any, newEltObj: any) {
    const existingDesignations: Designation[] = existingEltObj.designations;
    const newDesignations: Designation[] = newEltObj.designations;
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

export function mergeDefinitions(existingEltObj: any, newEltObj: any) {
    const existingDefinitions: Definition[] = existingEltObj.definitions;
    const newDefinitions: Definition[] = newEltObj.definitions;
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

const NHLBI_CSV_HEADER_MAP: any = {};
