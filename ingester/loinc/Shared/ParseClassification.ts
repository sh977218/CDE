import {classifyItem} from 'server/classification/orgClassificationSvc';
import {isEmpty} from 'lodash';
import {loinc_classification_type_map} from 'ingester/loinc/Mapping/LOINC_CLASSIFICATION_TYPE_MAP';
import {DEFAULT_LOINC_CONFIG} from 'ingester/loinc/Shared/utility';

export async function parseClassification(elt, loinc, config = DEFAULT_LOINC_CONFIG) {
    if (isEmpty(config.classificationArray)) {
        const basicAttributes = loinc['Basic Attributes'];
        const Abbreviation = basicAttributes.Class
        const Type = loinc_classification_type_map[basicAttributes.Type];
        const loinc_classification = await LOINC_CLASSIFICATION_MAPPING.findOne({Abbreviation, Type}).lean();
        if (loinc_classification) {
            config.classificationArray = [loinc_classification.Value];
        } else {
            console.log(`${loinc['LOINC Code']} has empty classification type. Type: ${Type}; Abbreviation:${Abbreviation} `);
            throw new Error('LOINC classification Map is empty. See README.');
        }
    }
    classifyItem(elt, config.classificationOrgName, config.classificationArray);
}
