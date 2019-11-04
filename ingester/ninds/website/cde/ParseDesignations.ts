import { uniq, indexOf } from 'lodash';

export function parseDesignations(nindsForms: any[]) {
    const cdeNameArray: any[] = [];
    const questionTextArray: any[] = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde['CDE Name']) {
                cdeNameArray.push(nindsCde['CDE Name']);
            }
            if (nindsCde['Additional Notes (Question Text)'] && nindsCde['Additional Notes (Question Text)'] !== 'N/A') {
                questionTextArray.push(nindsCde['Question Text']);
            }
        });
    });

    const _cdeNameArray = uniq(cdeNameArray);
    const _questionTextArray = uniq(questionTextArray);

    const designations = [];
    _cdeNameArray.forEach(n => {
        designations.push({
            designation: n,
            tags: []
        });
    });

    _questionTextArray.forEach(questionText => {
        const designationIndex = indexOf(designations, d => d.designation === questionText);
        if (designationIndex !== -1) {
            designations[designationIndex].tags.push('Question Text');
        } else {
            designations.push({designation: questionText, tags: ['Question Text']});
        }
    });
    return designations;
}
