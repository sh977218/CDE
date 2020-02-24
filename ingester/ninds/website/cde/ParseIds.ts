import { uniq } from 'lodash';

export function parseIds(nindsForms: any[]) {
    const cdeIdArray: any[] = [];
    const versionNumArray: any[] = [];
    const cadsrIdArray: any[] = [];
    const cdiscIdArray: any[] = [];
    const variableNameArray: any[] = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach((nindsCde: any) => {
            if (nindsCde['CDE ID']) {
                cdeIdArray.push(nindsCde['CDE ID']);
            }
            if (nindsCde['Version Number']) {
                versionNumArray.push(nindsCde['Version Number']);
            }
            if (nindsCde['External Id caDSR']) {
                cadsrIdArray.push(nindsCde['External Id caDSR']);
            }
            if (nindsCde['External Id CDISC']) {
                cdiscIdArray.push(nindsCde['External Id CDISC']);
            }
            if (nindsCde['Variable Name']) {
                variableNameArray.push(nindsCde['Variable Name']);
            }
        });
    });

    const _cdeIdArray = uniq(cdeIdArray);
    const _versionNumArray = uniq(versionNumArray);
    const _cadsrIdArray = uniq(cadsrIdArray);
    const _cdiscIdArray = uniq(cdiscIdArray);
    const _variableNameArray = uniq(variableNameArray);

    if (_cdeIdArray.length !== 1) {
        console.log('_cdeIdArray not 1');
        console.log('_cdeIdArray: ' + _cdeIdArray);
        process.exit(1);
    }
    if (_versionNumArray.length !== 1) {
        console.log('_versionNumArray not 1');
        console.log('_cdeIdArray: ' + _cdeIdArray);
        process.exit(1);
    }
    if (_variableNameArray.length !== 1) {
        console.log('_variableNameArray not 1');
        console.log('_cdeIdArray: ' + _cdeIdArray);
        process.exit(1);
    }

    if (_cadsrIdArray.length > 1) {
        console.log('_cadsrIdArray greater than 1');
        console.log('_cdeIdArray: ' + _cdeIdArray);
        process.exit(1);
    }
    if (_cdiscIdArray.length > 1) {
        console.log('_cdiscIdArray greater than 1');
        console.log('_cdiscIdArray: ' + _cdiscIdArray);
        process.exit(1);
    }

    const ids: any[] = [];
    ids.push({
        source: 'NINDS',
        id: _cdeIdArray[0],
        version: parseFloat(_versionNumArray[0]).toString()
    });
    ids.push({
        source: 'BRICS Variable Name',
        id: _variableNameArray[0]
    });

    _cadsrIdArray.forEach(v => {
        ids.push({
            source: 'NINDS caDSR',
            id: v
        });
    });
    _cdiscIdArray.forEach(v => {
        ids.push({
            source: 'NINDS CDISC',
            id: v
        });
    });

    return ids;
}
