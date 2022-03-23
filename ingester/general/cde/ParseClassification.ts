import { classifyItem } from 'server/classification/orgClassificationSvc';
import { DEFAULT_LOADER_CONFIG } from 'ingester/general/shared/utility';
import { getCell } from 'shared/loader/utilities/utility';


export function parseClassification(eltObj: any, row: any) {

    const classifications = getCell(row, 'Classifications/Tags/Keywords for the CDE');

    const classificationArray: string[] = [...DEFAULT_LOADER_CONFIG.classificationArray];
    if(!!classifications){
        classificationArray.push(...classifications.split('|').map(t => t.trim()).filter(t => t));
    }
    classifyItem(eltObj, DEFAULT_LOADER_CONFIG.classificationOrgName, classificationArray);
}
