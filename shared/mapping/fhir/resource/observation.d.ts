import { FormQuestion } from 'shared/form/form.model';
import { FhirEncounter, FhirObservation, FhirPatient } from 'shared/mapping/fhir/fhirResource.model';

declare function newObservation(encounter?: FhirEncounter, patient?: FhirPatient): FhirObservation;
declare function observationFromForm(q: FormQuestion, codeToDisplay: any, encounter?: FhirEncounter, patient?: FhirPatient): FhirObservation;
