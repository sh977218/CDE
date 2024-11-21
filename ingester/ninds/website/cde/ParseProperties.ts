import {uniq} from 'lodash';

export function parseProperties(nindsForms: any[]) {
    const previousTitleArray: string[] = [];
    const aliasesForVariableNameArray: string[] = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach((nindsCde: any) => {
            if (nindsCde['Previous Title']) {
                previousTitleArray.push(nindsCde['Previous Title']);
            }
            if (nindsCde['Aliases for Variable Name']) {
                aliasesForVariableNameArray.push(nindsCde['Aliases for Variable Name']);
            }
        });
    });

    const _previousTitle = uniq(previousTitleArray);
    const _aliasesForVariableNameArray = uniq(aliasesForVariableNameArray);

    const properties: any[] = [];
    _previousTitle.forEach(p => {
        properties.push({
            key: 'NINDS Previous Title',
            value: p,
            source: 'NINDS'
        });
    });
    _aliasesForVariableNameArray.forEach(a => {
        if (a !== 'Aliases for variable name not defined') {
            properties.push({
                key: 'Aliases for Variable Name',
                value: a,
                source: 'NINDS'
            });
        }
    });
    return properties;
}
