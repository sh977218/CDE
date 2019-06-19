import { FhirCode } from '../../../../shared/mapping/fhir/fhir.model';
import { CurationStatus } from '../../../../shared/models.model';

export function regStatusToPublicationStatus(status: CurationStatus): FhirCode<'active'|'draft'|'retired'|'unknown'> { // http://hl7.org/fhir/publication-status
    switch (status) {
        case 'Preferred Standard':
        case 'Standard':
        case 'Qualified':
            return 'active';
        case 'Retired':
            return 'retired';
        case 'Recorded':
        case 'Candidate':
        case 'Incomplete':
            return 'draft';
        default:
            return 'unknown';
    }
}
