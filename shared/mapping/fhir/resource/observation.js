import { getName } from 'shared/elt';
import { getRef, newReference } from 'shared/mapping/fhir/fhirDatatypes';
import { newCodeableConcept } from 'shared/mapping/fhir/datatypes/codeableConcept';
import { newCoding } from 'shared/mapping/fhir/datatypes/coding';

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
        subject: patient ? newReference(getRef(patient)) : undefined,
        context: encounter ? newReference(getRef(encounter)) : undefined,
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

    let baseAndRef = eltRef || fe;
    let compatibleId = null;
    baseAndRef.ids.some(id => {
        if (id.source === 'LOINC') {
            compatibleId = id;
            return true;
        }
    });
    function codeableConceptCoding(system, code, version, display) {
        observationComponent.code = newCodeableConcept([newCoding(system, code, version, display)]);
        return Promise.resolve(observationComponent);
    }
    if (compatibleId) {
        return getDisplay(compatibleId.source, compatibleId.id).then(display =>
            codeableConceptCoding(compatibleId.source, compatibleId.id, compatibleId.version, display));
    } else {
        return codeableConceptCoding('NLM', baseAndRef.tinyId, baseAndRef.version, eltRef ? eltRef.name : getName(fe));
    }
}

export function observationFromForm(fe, getDisplay, encounter = null, patient = null) {
    return observationComponentFromForm(fe, getDisplay, newObservation(encounter, patient)).then(observation => {
        if (Array.isArray(fe.metadataTags)) {
            let devices = fe.metadataTags.filter(m => m.key === 'device');
            if (devices.length) {
                observation.device = newReference(getRef(devices[0].value));
            }
        }
        return observation;
    });
}
