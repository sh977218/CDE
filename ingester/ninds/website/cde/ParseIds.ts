import { uniq } from 'lodash';

export function parseIds(nindsForms) {
    const cdeIdArray = [];
    const versionNumArray = [];
    const cadsrIdArray = [];
    const variableNameArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde['CDE ID']) {
                cdeIdArray.push(nindsCde['CDE ID']);
            }
            if (nindsCde['Version #']) {
                versionNumArray.push(nindsCde['Version #']);
            }
            if (nindsCde['caDSR ID']) {
                cadsrIdArray.push(nindsCde['caDSR ID']);
            }
            if (nindsCde['Variable Name']) {
                variableNameArray.push(nindsCde['Variable Name']);
            }
        });
    });

    const _cdeIdArray = uniq(cdeIdArray);
    const _versionNumArray = uniq(versionNumArray);
    const _cadsrIdArray = uniq(cadsrIdArray);
    const _variableNameArray = uniq(variableNameArray);

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

    const ids = [];
    _cdeIdArray.forEach(v => {
        ids.push({
            source: 'NINDS',
            id: v,
            version: _versionNumArray[0]
        });
    });
    _cadsrIdArray.forEach(v => {
        ids.push({
            source: 'NINDS caDSR',
            id: v
        });
    });
    _variableNameArray.forEach(v => {
        ids.push({
            source: 'NINDS Variable Name',
            id: v
        });
    });

    return ids;
};
