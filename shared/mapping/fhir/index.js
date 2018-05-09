import { capString } from 'shared/system/util';

export const externalCodeSystems = [
    {id: 'LOINC', uri: 'http://loinc.org'},
    {id: 'UCUM', uri: 'http://unitsofmeasure.org'}
];

export const externalCodeSystemsMap = {
    'LOINC': 'http://loinc.org',
    'UCUM': 'http://unitsofmeasure.org'
};
