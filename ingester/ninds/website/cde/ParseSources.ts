import {uniq} from 'lodash';
import {imported} from 'ingester/shared/utility';

export function parseSources(nindsForms: any[]) {
    const versionDateArray: string[] = [];
    const dataTypeArray: string[] = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach((nindsCde: any) => {
            if (nindsCde['Version Date']) {
                versionDateArray.push(nindsCde['Version Date']);
            }
            if (nindsCde['Data Type']) {
                dataTypeArray.push(nindsCde['Data Type']);
            }
        });
    });
    if (dataTypeArray.length === 0) {
        console.log('dataTypeArray is empty');
        process.exit(1);
    }

    const _versionDateArray = uniq(versionDateArray);
    const _dataTypeArray = uniq(dataTypeArray);
    if (_versionDateArray.length > 1) {
        console.log('uniqVersionDateArray greater 1');
        process.exit(1);
    }
    if (_dataTypeArray.length !== 1) {
        console.log('uniqDataTypeArray not 1');
        process.exit(1);
    }

    const sources: any[] = [];
    _versionDateArray.forEach(v => {
        sources.push({
            imported,
            sourceName: 'NINDS',
            updated: v,
            datatype: _dataTypeArray[0]
        });
    });
    return sources;
}
