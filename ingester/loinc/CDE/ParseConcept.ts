import {map as CONCEPT_TYPE_MAP} from '../Mapping/LOINC_CONCEPT_TYPE_MAP';

export function parseConcepts(loinc) {
    const concepts = {objectClass: [], property: [], dataElementConcept: []};
    const partDescriptions = loinc['Part Descriptions'];
    if (partDescriptions) {
        partDescriptions.forEach(pd => {
            const basicAttributes = pd['Basic Attributes'];
            if (basicAttributes) {
                const type = CONCEPT_TYPE_MAP[basicAttributes.Type];
                if (!concepts[type]) {
                    console.log(`loincCode: ${loinc['LOINC Code']}.`);
                    console.log(`concepts: ${concepts}.`);
                    console.log(`type: ${type}.`);
                    console.log(`${concepts[type]} is null.`);
                    throw new Error(`${concepts[type]} is null.`);
                }
                concepts[type].push({
                    name: basicAttributes.Name,
                    origin: pd.text,
                    originId: pd.partyId,
                });
            }
        });
    }
    return concepts;
}
