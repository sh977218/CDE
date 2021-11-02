import { FormElement } from 'shared/form/form.model';
import { getIds } from 'shared/form/formAndFe';
import { newCoding } from 'shared/mapping/fhir/datatype/fhirCoding';
import { newCodeableConcept } from 'shared/mapping/fhir/datatype/fhirCodeableConcept';
import { toRef } from 'shared/mapping/fhir/datatype/fhirReference';
import {
    FhirEncounter, FhirObservation, FhirObservationComponent, FhirPatient
} from 'shared/mapping/fhir/fhirResource.model';
import { FhirCodeableConcept } from 'shared/mapping/fhir/fhir.model';

type GetDisplay = (system?: string, code?: string) => Promise<string | void>;

/* Limitations:
 *  * only transfer the first LOINC code to FHIR, no other codes
 */

export function newObservation(patient?: FhirPatient, encounter?: FhirEncounter): Partial<FhirObservation> {
    return {
        resourceType: 'Observation',
        id: undefined,
        status: 'final',
        category: undefined,
        code: undefined,
        subject: patient ? toRef(patient) : undefined,
        context: encounter ? toRef(encounter) : undefined,
        effectiveDateTime: encounter && encounter.period ? encounter.period.start : undefined,
        issued: encounter && encounter.period ? encounter.period.start : undefined
    };
}

export function newObservationComponent(code: FhirCodeableConcept): FhirObservationComponent {
    return {
        code
    };
}

export function observationComponentFromForm(fe: FormElement, getDisplay: GetDisplay, observationComponent?: FhirObservationComponent
    | Partial<FhirObservationComponent>): Promise<FhirObservationComponent> {
    const ids = getIds(fe) || [];
    const id = ids.filter(id => id.source === 'LOINC')[0] || ids[0];
    if (!id) {
        throw new Error('cannot be here without ids');
    }
    return getDisplay(id.source, id.id).then(display => {
        const code = newCodeableConcept([newCoding(id.source, id.id, id.version, display || '')]);
        if (!observationComponent) {
            observationComponent = newObservationComponent(code);
        } else {
            observationComponent.code = code;
        }
        return observationComponent as FhirObservationComponent;
    });
}

export function observationFromForm(fe: FormElement, getDisplay: GetDisplay, encounter?: FhirEncounter,
                                    patient?: FhirPatient): Promise<FhirObservation> {
    return observationComponentFromForm(fe, getDisplay, newObservation(patient, encounter)).then((component: FhirObservationComponent) => {
        const observation = component as FhirObservation;
        if (Array.isArray(fe.metadataTags)) {
            const devices = fe.metadataTags.filter(m => m.key === 'device');
            if (devices.length) {
                observation.device = toRef(devices[0].value);
            }
        }
        return observation;
    });
}
