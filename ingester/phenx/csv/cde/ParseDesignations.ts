import { isEmpty } from 'lodash';
import { DEFAULT_RADX_UP_CONFIG } from 'ingester/phenx/Shared/utility';

export function parseDesignations(row: any, config = DEFAULT_RADX_UP_CONFIG) {
    const source = config.source;
    const designations = [];

    const fieldLabel = row['Field Label'];
    if (!isEmpty(fieldLabel)) {
        designations.push({
            designation: fieldLabel,
            source,
            tags: ['Question Text'],
        });
    }
    const sectionHeader = row['Section Header'];
    if (!isEmpty(sectionHeader)) {
        designations.push({
            designation: sectionHeader,
            source,
            tags: ['Question Text'],
        });
    }

    const variableName = row['Variable / Field Name'];
    const existingDesignation = designations.filter(d => d.designation === variableName).length > 0;
    if (!existingDesignation) {
        designations.push({
            designation: variableName,
            source,
            tags: [],
        });
    }

    return designations;
}

export function parseRadxDesignations(row: any, config = DEFAULT_RADX_UP_CONFIG) {
    const source = config.source;
    const designations = [];

    const fieldLabel = row['Field Label'];
    if (!isEmpty(fieldLabel)) {
        designations.push({
            designation: fieldLabel,
            source,
            tags: ['RADx Question Text'],
        });
    }
    const sectionHeader = row['Section Header'];
    if (!isEmpty(sectionHeader)) {
        designations.push({
            designation: sectionHeader,
            source,
            tags: ['RADx Question Text'],
        });
    }

    const variableName = row['Variable / Field Name'];
    const existingDesignation = designations.filter(d => d.designation === variableName).length > 0;
    if (!existingDesignation) {
        designations.push({
            designation: variableName,
            source,
            tags: ['RADx-UP Variable Name'],
        });
    }

    return designations;
}
