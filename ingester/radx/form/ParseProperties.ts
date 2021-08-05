import { DEFAULT_RADX_CONFIG } from 'ingester/radx/shared/utility';
import { getCell } from 'shared/loader/utilities/utility';

export function parseProperties(row: any) {
    const properties:any [] = [];

    for(const prop in row){
        if(row.hasOwnProperty(prop) && prop.includes('property -')){
            const key = prop.split('-')[1];
            if(getCell(row,prop)){
                properties.push({key, value: getCell(row, prop), source: DEFAULT_RADX_CONFIG.source});
            }
        }
    }

    return properties;
}