import { isEqual, trim } from 'lodash';
import { getCell } from 'shared/loader/utilities/utility';


export function parseDesignations(row: any){
    const title = getCell(row, 'naming.designation');
    let questionText = getCell(row, 'Question Text / Item Text');
    questionText = questionText.split(String.fromCharCode(145,145)).join('"');
    questionText = questionText.split(String.fromCharCode(146,146)).join('"');
    questionText = questionText.split(String.fromCharCode(145)).join("'");
    questionText = questionText.split(String.fromCharCode(146)).join("'");
    const designations = [];
    if(isEqual(title, questionText)){
        designations.push({
            designation: title,
            tags: ['Question Text']
        });
    }
    else{
        designations.push({
            designation: title,
            tags: []
        });
        designations.push({
            designation: questionText,
            tags: ['Question Text']
        });
    }
    return designations;
}