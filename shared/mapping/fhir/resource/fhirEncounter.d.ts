import { FhirEncounter } from 'shared/mapping/fhir/fhirResource.model';

declare function newEncounter(date: string, subject: string, serviceProvider?: string): FhirEncounter;
