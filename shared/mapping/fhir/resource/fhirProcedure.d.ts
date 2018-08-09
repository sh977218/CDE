import { FhirEncounter, FhirPatient, FhirProcedure } from 'shared/mapping/fhir/fhirResource.model';

declare function newProcedure(encounter?: FhirEncounter, patient?: FhirPatient): FhirProcedure;
