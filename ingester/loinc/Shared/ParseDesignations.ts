import { trimWhite } from 'ingester/shared/utility';

function isDesignationsExisted(designations, designation) {
    let temp = designations.filter(n => n.designation === designation.designation);
    if (temp.length > 0) return temp[0];
    else if (designation === {}) return false;
    else return false;
}

function isQuestionTextExist(designations) {
    let temp = designations.filter(n => n.tags.filter(t => {
        return t.toLowerCase().indexOf('Question Text') > 0;
    }).length > 0);
    return temp.length > 0;
}

export function parseDesignations(loinc, element: any = {}) {
    if (loinc.loinc) loinc = loinc.loinc;
    let designations = [];
    let longCommonNameObj = {};
    let shortNameObj = {};
    let NAME = loinc['NAME'];
    if (NAME) {
        if (NAME['Long Common Name']) {
            longCommonNameObj = {
                designation: trimWhite(NAME['Long Common Name']),
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
                designation: trimWhite(NAME['Shortname']),
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
        if (loinc['SURVEY QUESTION'].Text) {
            questionTextDesignationObj = {
                designation: trimWhite(loinc['SURVEY QUESTION'].Text),
                tags: ['Question Text']
            };
            let existingDesignation = isDesignationsExisted(designations, questionTextDesignationObj);
            if (existingDesignation) {
                existingDesignation.tags.push('Question Text');
            } else {
                designations.push(questionTextDesignationObj);
            }
        }
    }
    let LOINCNAME = loinc['LOINC NAME'];
    let loincNameObj = {};
    if (element && element.overrideDisplayNameText) {
        loincNameObj = {
            designation: trimWhite(element.overrideDisplayNameText),
            tags: ['Question Text']
        };
        let existingDesignation = isDesignationsExisted(designations, loincNameObj);
        if (existingDesignation) {
            if (isQuestionTextExist(designations)) {
                existingDesignation.tags.push('Question Text');
            }
        } else {
            designations.push(loincNameObj);
        }
    }
    if (LOINCNAME) {
        loincNameObj = {
            designation: trimWhite(LOINCNAME),
            tags: ['Question Text']
        };
        let existingDesignation = isDesignationsExisted(designations, loincNameObj);
        if (existingDesignation) {
            if (isQuestionTextExist(designations)) {
                existingDesignation.tags.push('Question Text');

            }
        } else {
            designations.push(loincNameObj);
        }
    }
    return designations;
}