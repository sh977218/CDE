import { capString } from 'shared/system/util';

export const externalCodeSystems = [
    {id: 'Assessment Center', uri: 'http://www.neuroqol.org/ContactUs/Pages/default.aspx'},
    {id: 'LOINC', uri: 'http://loinc.org'},
    {id: 'NLM', uri: 'https://cde.nlm.nih.gov'},
    {id: 'SNOMED', uri: 'http://snomed.info/sct'},
    {id: 'UCUM', uri: 'http://unitsofmeasure.org'}
];

export const externalCodeSystemsMap = {
    'Assessment Center': 'http://www.neuroqol.org/ContactUs/Pages/default.aspx',
    'LOINC': 'http://loinc.org',
    'NLM': 'https://cde.nlm.nih.gov',
    'SNOMED': 'http://snomed.info/sct',
    'UCUM': 'http://unitsofmeasure.org',
};

export function codeSystemIn(uri) {
    let results = externalCodeSystems.filter(c => c.uri === uri);
    return results.length ? results[0].id : '';
}

export function codeSystemOut(system = undefined, fe = undefined) {
    let s = system;
    if (fe && fe.question && fe.question.cde && Array.isArray(fe.question.cde.ids) && fe.question.cde.ids.length) {
        s = fe.question.cde.ids[0].source;
    }

    return s ? externalCodeSystemsMap[s] || s : undefined;
}
