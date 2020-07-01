import { parseValueDomain } from 'ingester/phenx/redCap/parseValueDomain';

export function parseNichdValueDomain(row: any) {
    return parseValueDomain(row);
}
