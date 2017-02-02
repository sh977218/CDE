function isNameExisted(naming, name) {
    var temp = naming.filter(function (n) {
        return (n.designation === name.designation
        && n.definition === name.definition
        && n.languageCode === name.languageCode
        && n.source === name.source)
    });
    if (temp.length > 0)return temp[0];
    else if (name === {}) return false;
    else return false;
}

exports.parseNaming = function (loinc) {
    var naming = [];
    var longCommonNameObj = {};
    var shortNameObj = {};
    var NAME = loinc['NAME']['NAME'];
    if (NAME) {
        if (NAME['Long Common Name']) {
            longCommonNameObj = {
                designation: NAME['Long Common Name'],
                definition: '',
                languageCode: "EN-US",
                tags: [{tag: "Long Common Name"}],
                source: 'LOINC'
            };
            var existingName = isNameExisted(naming, longCommonNameObj);
            if (existingName) {
                existingName.tags.push({tag: 'Long Common Name'});
            } else {
                naming.push(existingName);
            }
        }
        if (NAME['Shortname']) {
            shortNameObj = {
                designation: NAME['Shortname'],
                definition: '',
                languageCode: "EN-US",
                tags: [{tag: "Shortname"}],
                source: 'LOINC'
            };
            var existingName = isNameExisted(naming, shortNameObj);
            if (existingName) {
                existingName.tags.push({tag: 'Shortname'});
            } else {
                naming.push(existingName);
            }

        }
    }
    var LOINCNAME = loinc['LOINC NAME']['LOINC NAME']['LOINC NAME'];
    var loincNameObj = {};
    if (LOINCNAME) {
        loincNameObj = {
            designation: LOINCNAME,
            definition: '',
            languageCode: 'EN-US',
            tags: [{tag: ''}],
            source: 'LOINC'
        };
        var existingName = isNameExisted(naming, loincNameObj);
        if (existingName) {
            existingName.tags.push({tag: ''});
        } else {
            naming.push(existingName);
        }
    }
    var questionTextNameObj = {};
    if (loinc['SURVEY QUESTION']) {
        if (loinc['SURVEY QUESTION']['SURVEY QUESTION'].Text && loinc['SURVEY QUESTION']['SURVEY QUESTION'].Text.length > 0) {
            questionTextNameObj = {
                designation: loinc['SURVEY QUESTION']['SURVEY QUESTION'].Text,
                definition: '',
                languageCode: 'EN-US',
                tags: [{tag: 'Question Text'}],
                source: 'LOINC'
            };
        }
    }
    var termDefinitionNameObj = {};
    if (loinc['TERM DEFINITION/DESCRIPTION(S)']) {
        loinc['TERM DEFINITION/DESCRIPTION(S)']['TERM DEFINITION/DESCRIPTION(S)'].forEach(function (t) {
            termDefinitionNameObj = {
                designation: '',
                definition: t.Description,
                languageCode: "EN-US",
                tags: [{tag: 'TERM DEFINITION/DESCRIPTION(S)'}],
                source: 'LOINC'
            };
        })
    }

    return naming;
};