import { FhirDateTime, FhirPeriod } from 'shared/mapping/fhir/fhir.model';

export function newPeriod(start: FhirDateTime, end?: FhirDateTime): FhirPeriod {
    if (!end) {
        return {start, end: start};
    } else {
        return {start, end};
    }
}
