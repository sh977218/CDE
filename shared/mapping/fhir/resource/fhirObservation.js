import { newCodeableConcept } from 'shared/mapping/fhir/datatype/fhirCodeableConcept';
import { newCoding } from 'shared/mapping/fhir/datatype/fhirCoding';
import { toRef } from 'shared/mapping/fhir/datatype/fhirReference';

/* Limitations:
 *  * only transfer the first LOINC code to FHIR, no other codes
 */

export function newObservation(encounter = null, patient = null) {
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
    let eltRef = null;
    if (fe.elementType === 'form') {
        if (fe.inForm) {
            eltRef = fe.inForm.form;
        }
    } else if (fe.elementType === 'question') {
        eltRef = fe.question.cde;
    }
    if (!Array.isArray(eltRef.ids) || !eltRef.ids.length) eltRef = fe;
    if (!Array.isArray(eltRef.ids) || !eltRef.ids.length) throw new Error('cannot be here without ids');
    let id = eltRef.ids[0];

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
