import { classifyItem } from 'server/classification/orgClassificationSvc';
import { DEFAULT_RADX_CONFIG } from 'ingester/radx/shared/utility';
import { getCell } from 'shared/loader/utilities/utility';


export function parseClassification(eltObj: any, row: any) {

    const classifications = getCell(row, 'Classifications/Tags/Keywords for the CDE');

    let classificationArray: string[] = ['Not Classified'];
    if(!!classifications){
        classificationArray = classifications.split(';');
    }
    classifyItem(eltObj, DEFAULT_RADX_CONFIG.classificationOrgName, classificationArray);
}