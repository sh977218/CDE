import { FhirCode } from 'shared/mapping/fhir/fhir.model';
import { CurationStatus } from 'shared/models.model';

declare function regStatusToPublicationStatus(status: CurationStatus): FhirCode;
