const _ = require('lodash');

exports.parseProperties = nindsForms => {
    let previousTitleArray = [];
    let aliasesForVariableNameArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde['Previous Title'])
                previousTitleArray.push(nindsCde['Previous Title']);
            if (nindsCde['Aliases for Variable Name'])
                aliasesForVariableNameArray.push(nindsCde['Aliases for Variable Name']);
        })
    });

    let _previousTitle = _.uniq(previousTitleArray);
    let _aliasesForVariableNameArray = _.uniq(aliasesForVariableNameArray);

    let properties = [];
    _previousTitle.forEach(p => {
        properties.push({
            key: 'NINDS Previous Title',
            value: p,
            source: 'NINDS'
        });
    });
    _aliasesForVariableNameArray.forEach(a => {
        if (a !== 'Aliases for variable name not defined')
            properties.push({
                key: 'Aliases for Variable Name',
                value: a,
                source: 'NINDS'
            });
    });
    return properties;
};