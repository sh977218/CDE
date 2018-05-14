import { capString } from 'shared/system/util';

export const externalCodeSystems = [
    {id: 'LOINC', uri: 'http://loinc.org'},
    {id: 'NLM', uri: 'https://cde.nlm.nih.gov'},
    {id: 'UCUM', uri: 'http://unitsofmeasure.org'}
];

export const externalCodeSystemsMap = {
    'LOINC': 'http://loinc.org',
    'NLM': 'https://cde.nlm.nih.gov',
    'UCUM': 'http://unitsofmeasure.org'
};
