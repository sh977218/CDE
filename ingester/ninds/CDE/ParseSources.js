const _ = require('lodash');

exports.parseSources = nindsForms => {
    let versionDateArray = [];
    let dataTypeArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde.versionDate)
                versionDateArray.push(nindsCde.versionDate);
            if (nindsCde.dataType)
                dataTypeArray.push(nindsCde.dataType);
        })
    });

    let _versionDateArray = _.uniq(versionDateArray);
    let _dataTypeArray = _.uniq(dataTypeArray);
    if (_versionDateArray.length !== 1) {
        console.log('dataTypeArray not 1');
        process.exit(1);
    }
    if (_dataTypeArray.length !== 1) {
        console.log('uniqDataTypeArray not 1');
        process.exit(1);
    }

    let sources = [];
    _versionDateArray.forEach(v => {
        sources.push({
            sourceName: 'NINDS',
            updated: v,
            datatype: _dataTypeArray[0]
        })
    });
    return sources;
};