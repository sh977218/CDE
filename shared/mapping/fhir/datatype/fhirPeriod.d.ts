import { FhirDateTime, FhirPeriod } from 'shared/mapping/fhir/fhir.model';

declare function newPeriod(start: FhirDateTime, end?: FhirDateTime): FhirPeriod;
