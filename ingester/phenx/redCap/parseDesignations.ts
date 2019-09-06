import { isEmpty } from 'lodash';

export function parseDesignations(row) {
    let designations = [];

    let sectionHeader = row['Section Header'];
    let fieldLabel = row['Field Label'];
    let fieldLabelDesignation;
    let sectionHeaderDesignation;
    if (!isEmpty(fieldLabel.trim())) {
        fieldLabelDesignation = {
            designation: fieldLabel.trim(),
            source: 'PhenX',
            tags: ['Question Text']
        };
        designations.push(fieldLabelDesignation);
    }
    if (!isEmpty(sectionHeader.trim())) {
        sectionHeaderDesignation = {
            designation: sectionHeader.trim(),
            source: 'PhenX',
            tags: ['Question Text']
        };
        designations.push(sectionHeaderDesignation);
    }

    return designations;
}
