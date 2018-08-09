import { capString } from 'shared/system/util';

export function regStatusToPublicationStatus(status) { // http://hl7.org/fhir/publication-status
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
