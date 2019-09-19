import { find, uniq } from 'lodash';

export function parseDesignations(loinc) {
    const designations: any[] = [{
        designation: loinc['Long Common Name'],
        tags: ['Long Common Name']
    }];
    const additionalNames = loinc['Additional Names'];
    for (const additionalName in additionalNames) {
        if (additionalNames.hasOwnProperty(additionalName)) {
            const newName = additionalNames[additionalName];
            const n: any = {};
            n.designation = newName;
            const existingName = find(designations, {designation: newName});
            if (existingName) {
                if (!existingName.tags) {
                    existingName.tags = [];
                }
                const allTags = existingName.tags.concat(additionalName);
                existingName.tags = uniq(allTags);
            } else {
                designations.push(n);
            }
        }
    }

    const surveyQuestion = loinc['Survey Question'];
    if (surveyQuestion) {
        const surveyQuestionText = surveyQuestion.text;
        if (surveyQuestionText) {
            const existingQuestionTextName = find(designations, {designation: surveyQuestionText});
            if (existingQuestionTextName) {
                if (!existingQuestionTextName.tags) {
                    existingQuestionTextName.tags = [];
                }
                const allTags = existingQuestionTextName.tags.concat('Question Text');
                existingQuestionTextName.tags = uniq(allTags);
            } else {
                designations.push({designation: surveyQuestionText, tags: ['Question Text']});
            }
        }
    }
    return designations;
}
