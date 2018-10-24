const _ = require('lodash');

exports.parseProperties = nindsForms => {
    let previousTitleArray = [];
    let aliasesForVariableNameArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde.previousTitle)
                previousTitleArray.push(nindsCde.previousTitle);
            if (nindsCde.aliasesForVariableName)
                aliasesForVariableNameArray.push(nindsCde.aliasesForVariableName);
        })
    });

    let _previousTitle = _.uniq(previousTitleArray);
    let _aliasesForVariableNameArray = _.uniq(aliasesForVariableNameArray);
    if (_previousTitle.length !== 1) {
        console.log('_previousTitle not 1');
        process.exit(1);
    }
    if (_aliasesForVariableNameArray.length !== 1) {
        console.log('_aliasesForVariableNameArray not 1');
        process.exit(1);
    }

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