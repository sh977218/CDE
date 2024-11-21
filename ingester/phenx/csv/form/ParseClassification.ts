import {DEFAULT_RADX_UP_CONFIG} from 'ingester/phenx/Shared/utility';
import {classifyItem} from 'server/classification/orgClassificationSvc';

export function parseClassification(form: any, config = DEFAULT_RADX_UP_CONFIG) {
    classifyItem(form, config.classificationOrgName, config.classificationArray.concat(['RADx-UP']));
}
