import { getCell } from 'ingester/nhlbi/shared/utility';
import { isEmpty } from 'lodash';

export function parseNhlbiDefinitions(row: any) {
    const definitions = [];

    let description = getCell(row, 'Definition');
    description = description.split('\n').join('<br>');

    if (!isEmpty(description)) {
        definitions.push({
            definition: description,
            tags: [],
            definitionFormat: 'html',
        });
    }

    return definitions;
}
