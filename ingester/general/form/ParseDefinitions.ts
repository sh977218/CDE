import { getCell } from 'shared/loader/utilities/utility';

export function parseDefinitions(row: any) {
    let def = getCell(row, 'naming.definiton');
    console.log('Form def: ' + "'" + def + "'");
    if (!def) {
        console.log('setting placeholder definitions');
        def = 'Placeholder definition';
    }

    return [{ definition: def, tags: [] }];
}
