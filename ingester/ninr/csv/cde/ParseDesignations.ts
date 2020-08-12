import { parseDesignations } from 'ingester/ninds/csv/cde/ParseDesignations';

export function parseNinrDesignations(ninrRow) {
    return parseDesignations(ninrRow);
}

