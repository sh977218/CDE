import {indexOf, uniq} from 'lodash';
import {sortDesignations} from 'ingester/shared/utility';

export function parseDesignations(nindsForms: any[]) {
    const cdeNameArray: any[] = [];
    const questionTextArray: any[] = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach((nindsCde: any) => {
            if (nindsCde['CDE Name']) {
                cdeNameArray.push(nindsCde['CDE Name']);
            }
            if (nindsCde['Additional Notes (Question Text)']) {
                if (nindsCde['Additional Notes (Question Text)'] !== 'N/A') {
                    questionTextArray.push(nindsCde['Additional Notes (Question Text)']);
                }
            }
        });
    });

    const _cdeNameArray = uniq(cdeNameArray);
    const _questionTextArray = uniq(questionTextArray);

    const designations: any[] = [];
    _cdeNameArray.forEach(n => {
        designations.push({
            designation: n,
            tags: []
        });
    });

    _questionTextArray.forEach(questionText => {
        const designationIndex = indexOf(designations, (d: any) => d.designation === questionText);
        if (designationIndex !== -1) {
            designations[designationIndex].tags.push('Question Text');
        } else {
            designations.push({designation: questionText, tags: ['Question Text']});
        }
    });
    return sortDesignations(designations);
}
