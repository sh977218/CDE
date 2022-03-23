import { isEqual, trim } from 'lodash';
import { getCell } from 'shared/loader/utilities/utility';


export function parseDesignations(row: any){
    const title = getCell(row, 'naming.designation');
    const questionText = getCell(row, 'Preferred Question Text');
    const designations = [];
    if(isEqual(title, questionText)){
        designations.push({
            designation: title,
            tags: ['Preferred Question Text']
        });
    }
    else{
        designations.push({
            designation: title,
            tags: []
        });
        designations.push({
            designation: questionText,
            tags: ['Preferred Question Text']
        });
    }
    return designations;
}
