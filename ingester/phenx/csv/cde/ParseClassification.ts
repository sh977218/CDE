import {words} from 'lodash';
import {DEFAULT_RADX_UP_CONFIG} from 'ingester/phenx/Shared/utility';
import {classifyItem} from 'server/classification/orgClassificationSvc';

export function parseClassification(form: any, row: any, config = DEFAULT_RADX_UP_CONFIG) {
    const classificationArray = [];
    const formName = row['Form Name'];
    const _formName = words(formName).join(' ');
    const isTier2 = formName.indexOf('tier2') !== -1;
    if (isTier2) {
        classificationArray.push('Tier 2');
    } else {
        classificationArray.push('Tier 1');
    }
    classifyItem(form, config.classificationOrgName, classificationArray.concat([_formName]));
}


const RADX_UP_CLASSIFICATION_MAP = {
    'alcohol and tobacco': 'Alcohol and Tobacco',
    consent: 'Consent',
    'covid test': 'COVID Test',
    'health status': 'Health Status',
    'housing employment and insurance': 'Housing, Employment, and Insurance',
    identity: 'Identity',
    location: 'Location',
    'medical history': 'Medical History',
    sociodemographics: 'Sociodemographics',
    symptoms: 'Symptoms',
    testing: 'Testing',
    'vaccine acceptance': 'Vaccine Acceptance',
    'work ppe and distancing': 'Work PPE and Distancing',

    'tier 2 SSN and MRN': 'Tier 2 SSN and MRN',
    'tier 2 alcohol and tobacco': 'Tier 2 Alcohol and Tobacco',
    'tier 2 disability': 'Tier 2 Disability',
    'tier 2 drug use': 'Tier 2 Drug Use',
    'tier 2 food insecurity': 'Tier 2 Food Insecurity',
    'tier 2 housing': 'Tier 2 Housing',
    'tier 2 medical history': 'Tier 2 Medical History',
    'tier 2 medications': 'Tier 2 Medications',
    'tier 2 sociodemographics': 'Tier 2 Sociodemographics',
    'tier 2 testing': 'Tier 2 Testing',
    'tier 2 trust': 'Tier 2 Trust',
    'tier 2 vaccine acceptance': 'Tier 2 Vaccine Acceptance'
}

export function parseRadxClassification(form: any, row: any, config = DEFAULT_RADX_UP_CONFIG) {
    const classificationArray = [];
    const formName = row['Form Name'];
    const _formName = words(formName).join(' ');
    const isTier2 = formName.indexOf('tier2') !== -1;
    if (isTier2) {
        classificationArray.push('Tier 2');
    } else {
        classificationArray.push('Tier 1');
    }
    classifyItem(form, config.classificationOrgName, classificationArray.concat([RADX_UP_CLASSIFICATION_MAP[_formName]]));
}
