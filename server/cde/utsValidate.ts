import { PermissibleValue } from 'shared/models.model';
import { mapSeries } from 'shared/promise';
import { searchBySystemAndCode, CDE_SYSTEM_TO_UMLS_SYSTEM_MAP } from 'server/uts/utsSvc';
import { umlsPvFilter } from 'shared/de/umls';

export function validatePvs(permissibleValues: PermissibleValue[]): Promise<void> {
    /* istanbul ignore if */
    if (!Array.isArray(permissibleValues)) {
        return Promise.resolve();
    }
    return permissibleValues
        .reduce((ready, pv) => ready.then(() => validatePv(pv)), Promise.resolve());
}

export function validatePv(pv: PermissibleValue): Promise<void> {
    /* istanbul ignore if */
    if (!umlsPvFilter(pv)) {
        return Promise.resolve();
    }
    const system = pv.codeSystemName && CDE_SYSTEM_TO_UMLS_SYSTEM_MAP[pv.codeSystemName];
    /* istanbul ignore if */
    if (!system) {
        return Promise.resolve();
    }
    return mapSeries(
        pv.valueMeaningCode ? pv.valueMeaningCode.split(/[,:]/) : [],
        code => searchBySystemAndCode(system, code).then(
            dataRes => {
                /* istanbul ignore if */
                if (!dataRes) {
                    return Promise.reject('connection error');
                }
                /* istanbul ignore if */
                if (dataRes.startsWith('<html')) {
                    return Promise.reject('does not exist: error page');
                }
                const response = JSON.parse(dataRes);
                /* istanbul ignore if */
                if (!Array.isArray(response.result)) {
                    return Promise.reject('does not exist: ' + response.error);
                }
                return (response.result as any[]).map((r: any) => r.name as string);
            }
        )
    ).then(
        results => {
            function match(results: string[][], name: string): boolean {
                if (results.length === 0) {
                    return false;
                }
                return results[0].filter(n => name.startsWith(n.toLowerCase())).some(n => {
                    let newName = name.substr(n.length).trim();
                    if (!newName) {
                        return true;
                    }
                    if (newName.startsWith('a ')) {
                        newName = newName.substr(2);
                    }
                    return match(results.slice(1), newName);
                });
            }

            if (!pv.valueMeaningName || !match(results, pv.valueMeaningName.toLowerCase())) {
                return Promise.reject(pv.codeSystemName + '/' + pv.valueMeaningCode + ': Name does not match: ' + pv.valueMeaningName);
            }
        },
        err => {
            return Promise.reject(pv.codeSystemName + '/' + pv.valueMeaningCode + ': ' + err);
        }
    );
}
