import { CdeForm, FormElement } from 'shared/form/form.model';
import {
    FhirEncounter, FhirObservation, FhirObservationComponent, FhirPatient
} from 'shared/mapping/fhir/fhirResource.model';

type getDisplay = (system: string, code: string, cb: (display: string) => void) => void;

declare function newObservation(encounter?: FhirEncounter, patient?: FhirPatient): FhirObservation;
declare function newObservationComponent(): FhirObservationComponent;
declare function observationComponentFromForm(fe: FormElement|CdeForm, getDisplay: getDisplay, observationComponent?: FhirObservationComponent): Promise<FhirObservationComponent>;
declare function observationFromForm(fe: FormElement|CdeForm, getDisplay: getDisplay, encounter?: FhirEncounter, patient?: FhirPatient): Promise<FhirObservation>;
