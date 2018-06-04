import { externalCodeSystemsMap } from 'shared/mapping/fhir';
import { codeSystemOut, newReference } from 'shared/mapping/fhir/fhirDatatypes';

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

export function observationFromForm(q, codeToDisplay, encounter = null, patient = null) {
    let observation = newObservation(encounter, patient);
    let obsCode = {
        system: externalCodeSystemsMap['NLM'],
        code: q.question.cde.tinyId,
        display: q.question.cde.name
    };
    q.question.cde.ids.forEach(id => {
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
    if (Array.isArray(q.metadataTags)) {
        let devices = q.metadataTags.filter(m => m.key === 'device');
        if (devices.length) {
            observation.device = newReference('Device/' + devices[0].value.id);
        }
    }
    return observation;
}
