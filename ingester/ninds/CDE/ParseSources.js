const _ = require('lodash');

exports.parseSources = nindsForms => {
    let versionDateArray = [];
    let dataTypeArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde['Version Date'])
                versionDateArray.push(nindsCde['Version Date']);
            if (nindsCde['Data Type'])
                dataTypeArray.push(nindsCde['Data Type']);
        })
    });
    if (dataTypeArray.length === 0) {
        console.log('dataTypeArray is empty');
        process.exit(1);
    }

    let _versionDateArray = _.uniq(versionDateArray);
    let _dataTypeArray = _.uniq(dataTypeArray);
    if (_versionDateArray.length > 1) {
        console.log('uniqVersionDateArray greater 1');
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