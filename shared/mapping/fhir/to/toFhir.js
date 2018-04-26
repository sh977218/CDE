export function newIdentifier(uri, value, use) {
    return {
        system: uri,
        use: use, // http://hl7.org/fhir/identifier-use
        value: value,
    };
}
