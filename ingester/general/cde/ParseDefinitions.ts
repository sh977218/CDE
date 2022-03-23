import { getCell } from 'shared/loader/utilities/utility';
import { isEmpty } from 'lodash';

export function parseDefinitions(row: any){
    const definitions = [];

    const def = getCell(row, 'naming.definiton');
    if (!isEmpty(def)) {
        definitions.push({
            definition: def,
            tags: [],
            // definitionFormat: 'html'
        });
    }

    return definitions;
}
