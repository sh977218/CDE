import { FhirCode, FhirIdentifier, FhirUri } from 'shared/mapping/fhir/fhir.model';

export function newIdentifier(uri: FhirUri, value: string, use: FhirCode): FhirIdentifier {
    return {
        system: uri,
        use, // http://hl7.org/fhir/identifier-use
        value,
    };
}
