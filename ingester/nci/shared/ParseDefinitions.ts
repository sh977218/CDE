export function parseDefinitions(nciXmlCde) {
    return [{
        definition: nciXmlCde.PREFERREDDEFINITION[0],
        tags: []
    }];
}
