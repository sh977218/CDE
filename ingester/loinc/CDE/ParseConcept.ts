import { map as CONCEPT_TYPE_MAP } from '../Mapping/LOINC_CONCEPT_TYPE_MAP';

export function parseConcepts(loinc) {
    let concepts = {objectClass: [], property: [], dataElementConcept: []};
    if (loinc['PARTS']) {
        loinc['PARTS'].forEach(p => {
            let type = CONCEPT_TYPE_MAP[p['Part Type'].trim()];
            concepts[type].push({
                name: p['Part Name'].replace('<i>', '').replace('</i>', '').trim(),
                origin: 'LOINC - Part - ' + p['Part Type'],
                originId: p['Part No']
            })
        })
    }
    return concepts;
}