import { getCell } from 'shared/loader/utilities/utility';
import { isEmpty } from 'lodash';

export function parseDefinitions(row: any){
    const definitions = [];

    let def = getCell(row, 'naming.definiton');
    def = def.split(String.fromCharCode(145,145)).join('"');
    def = def.split(String.fromCharCode(146,146)).join('"');
    def = def.split(String.fromCharCode(145)).join("'");
    def = def.split(String.fromCharCode(146)).join("'");
    if (!isEmpty(def)) {
        definitions.push({
            definition: def,
            tags: [],
            // definitionFormat: 'html'
        });
    }

    return definitions;
}