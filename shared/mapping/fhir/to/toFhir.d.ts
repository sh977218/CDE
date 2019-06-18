import { FhirCode, FhirIdentifier, FhirUri } from 'shared/mapping/fhir/fhir.model';

declare function newIdentifier(uri: FhirUri, value: string, use: FhirCode): FhirIdentifier;
