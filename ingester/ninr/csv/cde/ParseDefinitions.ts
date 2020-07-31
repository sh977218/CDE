import { parseDefinitions } from 'ingester/ninds/csv/cde/ParseDefinitions';

export function parseNinrDefinitions(ninrRow) {
    return parseDefinitions(ninrRow);
}
