export function parseDefinitions(nciXmlCde) {
    return [{
        definition: nciXmlCde.PREFERREDDEFINITION[0],
        tags: []
    }];
}
export function parseDefinitions2(xml) {
    return [{
        definition: xml.preferredDefinition,
        tags: []
    }];
}
