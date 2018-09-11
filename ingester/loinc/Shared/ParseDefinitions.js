exports.parseDefinitions = function (loinc) {
    let definitions = [];
    let termDefinitionNameObj = {};
    if (loinc['TERM DEFINITION/DESCRIPTION(S)']) {
        loinc['TERM DEFINITION/DESCRIPTION(S)']['TERM DEFINITION/DESCRIPTION(S)'].forEach(function (t) {
            termDefinitionNameObj = {
                definition: t.Description,
                tags: ['TERM DEFINITION/DESCRIPTION(S)']
            };
            definitions.push(termDefinitionNameObj);
        })
    }

    return definitions;
};