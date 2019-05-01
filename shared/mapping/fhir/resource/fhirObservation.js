import { newCodeableConcept } from 'shared/mapping/fhir/datatype/fhirCodeableConcept';
import { newCoding } from 'shared/mapping/fhir/datatype/fhirCoding';
import { toRef } from 'shared/mapping/fhir/datatype/fhirReference';
import { getIds } from 'core/form/formAndFe';

/* Limitations:
 *  * only transfer the first LOINC code to FHIR, no other codes
 */

export function newObservation(encounter = undefined, patient = undefined) {
    return {
        resourceType: 'Observation',
        id: undefined,
        status: 'final',
        category: undefined,
        code: undefined,
        subject: patient ? toRef(patient) : undefined,
        context: encounter ? toRef(encounter) : undefined,
        effectiveDateTime: encounter ? encounter.period.start : undefined,
        issued: encounter ? encounter.period.start : undefined
    };
}

export function newObservationComponent() {
    return {
        code: undefined
    };
}

export function observationComponentFromForm(fe, getDisplay, observationComponent) {
    if (!observationComponent) {
        observationComponent = newObservationComponent();
    }
    let ids = getIds(fe) || [];
    let id = ids.filter(id => id.source === 'LOINC')[0] || ids[0];
    if (!id) {
        throw new Error('cannot be here without ids');
    }
    return getDisplay(id.source, id.id).then(display => {
        observationComponent.code = newCodeableConcept([newCoding(id.source, id.id, id.version, display)]);
        return observationComponent;
    });
}

export function observationFromForm(fe, getDisplay, encounter = null, patient = null) {
    return observationComponentFromForm(fe, getDisplay, newObservation(encounter, patient)).then(observation => {
        if (Array.isArray(fe.metadataTags)) {
            let devices = fe.metadataTags.filter(m => m.key === 'device');
            if (devices.length) {
                observation.device = toRef(devices[0].value);
            }
        }
        return observation;
    });
}
