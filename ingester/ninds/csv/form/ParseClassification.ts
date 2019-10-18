import { parseClassification as parseCdeClassification } from 'ingester/ninds/csv/cde/ParseClassification';

export function parseClassification(form, rows) {
    for (const row of rows) {
        parseCdeClassification(form, row);
    }
}
