import { getCell } from 'shared/loader/utilities/utility';


export function parseConcepts(row: any) {
    const concepts: {
        dataElementConcept: {name: string, origin: string, originId: string}[]
    } = {dataElementConcept: []};

    const dataConcepts = getCell(row, 'originId').split('|').map(t => t.trim()).filter(t => t);

    if(dataConcepts.length > 0){
        dataConcepts.forEach((c) => {
            const codeRegex = /\(([^)]+)\)/.exec(c);
            const name = c.replace(codeRegex[0], '').trim();
            concepts.dataElementConcept.push({
                name,
                origin: getCell(row, 'origin'),
                originId: codeRegex[1],
            });
        });

        return concepts;
    }

    return null;
}
