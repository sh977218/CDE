import { parseClassification as parseCdeClassification } from 'ingester/ninds/csv/cde/ParseClassification';

export function parseClassification(form, rows, defaultClassification = []) {
    for (const row of rows) {
        parseCdeClassification(form, row, defaultClassification);
    }
}

export function parseNhlbiClassification(existingFormObj) {
    const otherClassifications = existingFormObj.classification.filter(c => c.stewardOrg.name !== 'NHLBI');
    otherClassifications.push({
        stewardOrg: {name: 'NHLBI'},
        elements: [{
            name: 'Sickle Cell',
            elements: []
        }]
    });
    existingFormObj.classification = otherClassifications;
}
