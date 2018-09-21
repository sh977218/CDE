exports.parseDefinitions = function (loinc) {
    let definitions = [];
    if (loinc['TERM DEFINITION/DESCRIPTION(S)']) {
        loinc['TERM DEFINITION/DESCRIPTION(S)'].forEach(t => {
            definitions.push({
                definition: t.definition,
                tags: ['TERM DEFINITION/DESCRIPTION(S)']
            });
        })
    }

    return definitions;
};