exports.parseNaming = function (loinc) {
    var naming = [];
    var LOINCNAME = loinc['LOINC NAME']['LOINC NAME']['LOINC NAME'];
    if (LOINCNAME) {
        naming.push({
            designation: LOINCNAME,
            definition: '',
            languageCode: 'EN-US',
            context: {
                contextName: '',
                acceptability: 'preferred'
            },
            source: 'LOINC'
        })
    }

    var NAME = loinc['NAME']['NAME'];
    if (NAME) {
        if (NAME['Long Common Name']) {
            naming.push({
                designation: NAME['Long Common Name'],
                definition: '',
                languageCode: "EN-US",
                context: {
                    contextName: "Long Common Name",
                    acceptability: 'preferred'
                },
                source: 'LOINC'
            });
        }
        if (NAME['Shortname']) {
            naming.push({
                designation: NAME['Shortname'],
                definition: '',
                languageCode: "EN-US",
                context: {
                    contextName: "Shortname",
                    acceptability: 'preferred'
                },
                source: 'LOINC'
            });
        }
    }
    if (loinc['TERM DEFINITION/DESCRIPTION(S)']) {
        loinc['TERM DEFINITION/DESCRIPTION(S)']['TERM DEFINITION/DESCRIPTION(S)'].forEach(function (t) {
            naming.push({
                designation: '',
                definition: t.Description,
                languageCode: "EN-US",
                context: {
                    contextName: 'TERM DEFINITION/DESCRIPTION(S)',
                    acceptability: 'preferred'
                },
                source: 'LOINC'
            })
        })
    }
    return naming;
}