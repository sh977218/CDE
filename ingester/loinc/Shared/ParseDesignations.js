function isDesignationsExisted(designations, designation) {
    let temp = designations.filter(n => n.designation === designation.designation);
    if (temp.length > 0) return temp[0];
    else if (designation === {}) return false;
    else return false;
}

function isQuestionTextExist(designations) {
    let temp = designations.filter(n => n.tags.filter(t => t.tag && t.tag.toLowerCase().indexOf('Question Text') > 0).length > 0);
    return temp.length > 0;
}

exports.parseDesignations = function (loinc) {
    let designations = [];
    let longCommonNameObj = {};
    let shortNameObj = {};
    let NAME = loinc['NAME']['NAME'];
    if (NAME) {
        if (NAME['Long Common Name']) {
            longCommonNameObj = {
                designation: NAME['Long Common Name'],
                tags: ["Long Common Name"]
            };
            let existingDesignation = isDesignationsExisted(designations, longCommonNameObj);
            if (existingDesignation) {
                existingDesignation.tags.push('Long Common Name');
            } else {
                designations.push(longCommonNameObj);
            }
        }
        if (NAME['Shortname']) {
            shortNameObj = {
                designation: NAME['Shortname'],
                tags: ["Shortname"]
            };
            let existingDesignation = isDesignationsExisted(designations, shortNameObj);
            if (existingDesignation) {
                existingDesignation.tags.push('Shortname');
            } else {
                designations.push(shortNameObj);
            }

        }
    }
    let questionTextDesignationObj = {};
    if (loinc['SURVEY QUESTION']) {
        if (loinc['SURVEY QUESTION']['SURVEY QUESTION'].Text && loinc['SURVEY QUESTION']['SURVEY QUESTION'].Text.length > 0) {
            questionTextDesignationObj = {
                designation: loinc['SURVEY QUESTION']['SURVEY QUESTION'].Text,
                tags: ['Question Text']
            };
            let existingDesignation = isDesignationsExisted(designations, questionTextDesignationObj);
            if (existingDesignation) {
                existingDesignation.tags.push({tag: 'Question Text'});
            } else {
                designations.push(questionTextDesignationObj);
            }
        }
    }
    let LOINCNAME = loinc['LOINC NAME']['LOINC NAME']['LOINC NAME'];
    let loincNameObj = {};
    if (LOINCNAME) {
        loincNameObj = {
            designation: LOINCNAME,
            tags: ['Question Text']
        };
        let existingDesignation = isDesignationsExisted(designations, loincNameObj);
        if (existingDesignation) {
            if (isQuestionTextExist(designations))
                existingDesignation.tags.push('Question Text');
        } else {
            designations.push(loincNameObj);
        }
    }
    return designations;
};