exports.parseDefinitions = nciCde => {
    let definitions = [{
        definition: nciCde.PREFERREDDEFINITION[0],
        tags: []
    }];
    return definitions;
};