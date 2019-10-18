import { parseClassification as parseCdeClassification } from 'ingester/ninds/csv/cde/ParseClassification';
import { classifyItem } from 'server/classification/orgClassificationSvc';

const DEFAULT_CLASSIFICATION = ['Preclinical + NEI'];

export function parseClassification(form, rows) {
    for (const row of rows) {
        parseCdeClassification(form, row);
    }

    if (form.classification.length === 0) {
        classifyItem(form, 'NINDS', DEFAULT_CLASSIFICATION.concat(['Not Classified']));
    }
}
