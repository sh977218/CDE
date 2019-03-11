const _ = require('lodash');

exports.parseIds = nindsForms => {
    let cdeIdArray = [];
    let versionNumArray = [];
    let cadsrIdArray = [];
    let variableNameArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde['CDE ID'])
                cdeIdArray.push(nindsCde['CDE ID']);
            if (nindsCde['Version #'])
                versionNumArray.push(nindsCde['Version #']);
            if (nindsCde['caDSR ID'])
                cadsrIdArray.push(nindsCde['caDSR ID']);
            if (nindsCde['Variable Name'])
                variableNameArray.push(nindsCde['Variable Name']);
        })
    });

    let _cdeIdArray = _.uniq(cdeIdArray);
    let _versionNumArray = _.uniq(versionNumArray);
    let _cadsrIdArray = _.uniq(cadsrIdArray);
    let _variableNameArray = _.uniq(variableNameArray);

    if (_cdeIdArray.length !== 1) {
        console.log('_cdeIdArray not 1');
        process.exit(1);
    }
    if (_versionNumArray.length !== 1) {
        console.log('_versionNumArray not 1');
        process.exit(1);
    }
    if (_cadsrIdArray.length > 1) {
        console.log('_cadsrIdArray greater than 1');
        process.exit(1);
    }
    if (_variableNameArray.length !== 1) {
        console.log('_variableNameArray not 1');
        process.exit(1);
    }

    let ids = [];
    _cdeIdArray.forEach(v => {
        ids.push({
            source: 'NINDS',
            id: v,
            version: _versionNumArray[0]
        })
    });
    _cadsrIdArray.forEach(v => {
        ids.push({
            source: 'NINDS caDSR',
            id: v
        })
    });
    _variableNameArray.forEach(v => {
        ids.push({
            source: 'NINDS Variable Name',
            id: v
        })
    });

    return ids;
};