import { FhirDateTime, FhirPeriod } from '../../../../shared/mapping/fhir/fhir.model';

export function newPeriod(start: FhirDateTime, end?: FhirDateTime): FhirPeriod {
    if (!end) {
        return {start: start, end: start};
    } else {
        return {start: start, end: end};
    }
}
