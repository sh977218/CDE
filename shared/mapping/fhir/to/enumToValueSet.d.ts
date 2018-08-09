import { FhirCode, FhirUri } from 'shared/mapping/fhir/fhir.model';

declare function regStatusToPublicationStatus(status): FhirCode;
declare function sourceToUriMap(source): FhirUri;
