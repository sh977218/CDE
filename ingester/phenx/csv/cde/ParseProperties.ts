import { isEmpty } from 'lodash';
import { DEFAULT_RADX_UP_CONFIG } from 'ingester/phenx/Shared/utility';

export function parseProperties(row: any, config = DEFAULT_RADX_UP_CONFIG) {
    const source = config.source;
    const properties: any[] = [];
    const fieldNote = row['Field Note'];
    if (!isEmpty(fieldNote)) {
        properties.push({
            source,
            key: 'Field Note',
            value: fieldNote
        });
    }
    const fieldAnnotation = row['Field Annotation'];
    if (!isEmpty(fieldAnnotation)) {
        properties.push({
            source,
            key: 'Field Annotation',
            value: fieldAnnotation
        });
    }


    return properties;
}
