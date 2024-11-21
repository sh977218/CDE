import { classifyItem } from 'server/classification/orgClassificationSvc';
import { DEFAULT_NHLBI_CONFIG, getCell } from 'ingester/nhlbi/shared/utility';

export function parseNhlbiClassification(eltObj: any, row: any) {
    const classificationArray = DEFAULT_NHLBI_CONFIG.classificationArray.map(c => getCell(row, c));
    classifyItem(eltObj, 'NHLBI', ['Venous Thromboembolism (VTE)', ...classificationArray]);
}
