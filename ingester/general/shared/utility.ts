import { find, isEmpty, trim, uniq } from 'lodash';
import { Definition, Designation } from 'shared/models.model';

const XLSX = require('xlsx');

const DEFAULT_REGISTRATION_STATUS = 'Candidate';
const DEFAULT_ADMINISTRATIVE_STATUS = 'Org Approve';
const DEFAULT_CLASSIFICATION_ORG_NAME = 'NHLBI';
const DEFAULT_CLASSIFICATION_ARRAY: string[] = ['CONNECTS', 'Organ Support'];
const DEFAULT_STEWARD_ORG_NAME = 'NHLBI';
const DEFAULT_SOURCE = 'NHLBI';
const SKIP_ROWS = 2;
const ENDORSED = true;

const MAPPING_CSV_FILE = 'S:/MLB/CDE/RADX/NIH CDE-R Fields 2021-06-14.xlsx';

const DB_FIELD_COLUMN = 'Field';
const TEMPLATE_FIELD_COLUMN = 'GC CDE Template 2021 0526';

const CSV_HEADER_MAP: any = {

};

export class LoaderConfig {
    registrationStatus = DEFAULT_REGISTRATION_STATUS;
    administrativeStatus = DEFAULT_ADMINISTRATIVE_STATUS;
    classificationOrgName = DEFAULT_CLASSIFICATION_ORG_NAME;
    classificationArray: string[] = DEFAULT_CLASSIFICATION_ARRAY;
    source = DEFAULT_SOURCE;
    stewardOrg = DEFAULT_STEWARD_ORG_NAME;
    skipRows = SKIP_ROWS;
    endorsed = ENDORSED;
}

export const DEFAULT_LOADER_CONFIG = new LoaderConfig();

function populateHeaderMap(){
    const workbook = XLSX.readFile(MAPPING_CSV_FILE);
    const workBookRows = XLSX.utils.sheet_to_json(workbook.Sheets['CDE Fields - Combined List']);
    workBookRows.forEach((row:any, i:number) => {
        if(!!row[DB_FIELD_COLUMN] && !!row[TEMPLATE_FIELD_COLUMN]){
            CSV_HEADER_MAP[row[DB_FIELD_COLUMN]] = row[TEMPLATE_FIELD_COLUMN];
        }
    });
}

export function mergeDesignations(existingEltObj: any, newEltObj: any){
    const existingDesignations: Designation[] = existingEltObj.designations;
    const newDesignations: Designation[] = newEltObj.designations;
    newDesignations.forEach(newDesignation => {
        const foundDesignation: Designation | undefined = find(existingDesignations, {designation: newDesignation.designation});
        if (!foundDesignation) {
            existingDesignations.push(newDesignation);
        } else {
            const allTags = foundDesignation.tags.concat(newDesignation.tags);
            foundDesignation.tags = uniq(allTags).filter(t => !isEmpty(t));
        }
    });
}

export function mergeDefinitions(existingEltObj: any, newEltObj: any){
    const existingDefinitions: Definition[] = existingEltObj.definitions;
    const newDefinitions: Definition[] = newEltObj.definitions;
    newDefinitions.forEach(newDefinition => {
        const foundDefinition: Definition | undefined = find(existingDefinitions, {definition: newDefinition.definition});
        if (!foundDefinition) {
            existingDefinitions.push(newDefinition);
        } else {
            const allTags = foundDefinition.tags.concat(newDefinition.tags);
            foundDefinition.tags = uniq(allTags).filter(t => !isEmpty(t));
            foundDefinition.definitionFormat = newDefinition.definitionFormat;
        }
    });
}
