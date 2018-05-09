import { externalCodeSystemsMap } from '../index';
import { codeSystemOut, newReference } from '../fhirDatatypes';

export function newObservation(encounter = null, patient = null) {
    return {
        resourceType: 'Observation',
        id: undefined,
        status: 'final',
        category: [],
        code: undefined,
        subject: patient ? newReference('Patient/' + patient.id) : undefined,
        context: encounter ? newReference('Encounter/' + encounter.id) : undefined,
        effectiveDateTime: undefined,
        issued: encounter ? encounter.period.start : undefined
    };
}

export function observationFromForm(formElt, codeToDisplay, encounter = null, patient = null) {
    let observation = newObservation(encounter, patient);
    let obsCode = {
        system: "https://cde.nlm.nih.gov",
        code: formElt.question.cde.tinyId,
        display: formElt.question.cde.name
    };
    formElt.question.cde.ids.forEach(id => {
        if (id.source === 'LOINC') {
            obsCode.system = externalCodeSystemsMap['LOINC'];
            obsCode.code = id.id;
            obsCode.display = codeToDisplay[id.source + ":" + id.id];
        }
    });
    observation.code = {
        coding: [{
            system: codeSystemOut(obsCode.system),
            code: obsCode.code,
            display: obsCode.display
        }],
        text: obsCode.display
    };
    return observation;
}