import { parseProperties } from 'ingester/ninds/csv/cde/ParseProperties';

export function parseNinrProperties(ninrRow) {
    return parseProperties(ninrRow);
}
