import { getCell } from 'shared/loader/utilities/utility';


export function parseConcepts(row: any) {
    const concepts = {dataElementConcept: []};
    if(getCell(row, 'originId')){
        concepts.dataElementConcept.push({
            name: getCell(row, 'naming.designation'),
            origin: getCell(row, 'origin'),
            originId: getCell(row, 'originId'),
        });

        return concepts;
    }

    return null;
}