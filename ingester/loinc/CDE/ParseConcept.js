const CONCEPT_TYPE_MAP = require('../Mapping/LOINC_CONCEPT_TYPE_MAP').map;

exports.parseConcepts = function (loinc) {
    let concepts = {objectClass: [], property: [], dataElementConcept: []};
    if (loinc['PARTS']) {
        loinc['PARTS']['PARTS'].forEach(function (p) {
            concepts[CONCEPT_TYPE_MAP[p['Part Type'].trim()]].push({
                name: p['Part Name'].replace('<i>', '').replace('</i>', '').trim(),
                origin: 'LOINC - Part - ' + p['Part Type'],
                originId: p['Part No']
            })
        })
    }
    return concepts;
};
