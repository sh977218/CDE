interface VsacConcept {
    code: string;
    displayName: string;
    codeSystemName: string;
    codeSystemVersion: string;
}

interface VsacValueSetResponse {
    concepts: VsacConcept[];
    id: string;
    name: string;
    version: string;
}
