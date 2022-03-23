import { DEFAULT_LOADER_CONFIG } from 'ingester/general/shared/utility';
import { getCell } from 'shared/loader/utilities/utility';

export function parseProperties(row: any) {
    const properties:any [] = [];

    for (const prop in row) {
        if(row.hasOwnProperty(prop) && prop.includes('added property')){
            const tags = getCell(row, prop).split('|').map(t => t.trim()).filter(t => t);
            if(tags.length > 0){
                properties.push({key: 'Tags/Keywords', value: tags.join(', '), source: DEFAULT_LOADER_CONFIG.source});
            }
        }
    }

    const sources = getCell(row, 'source').split('|').map(t => t.trim()).filter(t => t);

    if(!!sources){
        properties.push({key: 'Project 5 Source', value: sources.join(', '), source: DEFAULT_LOADER_CONFIG.source});
    }

    return properties;
}
