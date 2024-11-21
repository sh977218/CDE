import {parseValueDomain} from 'ingester/ninds/csv/cde/ParseValueDomain';

export function parseNinrValueDomain(row: any) {
    return parseValueDomain(row);
}
