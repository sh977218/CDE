import { Dictionary } from 'async';
import * as Config from 'config';
import { Agent } from 'https';
import fetch from 'node-fetch';
import { respondError } from 'server/errorHandler/errorHandler';
import { consoleLog } from 'server/log/dbLogger';
import { handleErrors, isStatus, text } from 'shared/fetch';
import { withRetry } from 'shared/promise';

export const CDE_SYSTEM_TO_UMLS_SYSTEM_MAP: Dictionary<string> = {
    LOINC: 'LNC',
    'NCI Thesaurus': 'NCI',
    'SNOMEDCT US': 'SNOMEDCT_US',
    UMLS: 'UMLS',
    'AHRQ Common Formats': '',
    CDCREC: '',
    'HL7 Administrative Gender': '',
    'HL7 NullFlavor': '',
    ICD9CM: '',
    ICD10CM: '',
    OBI: '',
    SNOMED: '',
    'SNOMED CT': '',
    SNOMEDCT: '',
};
const config = Config as any;
const CONTINUE_TIMEOUT = 5000;
const httpsAgent = new Agent({
    rejectUnauthorized: false,
});
const ttys: Dictionary<string> = {
    LNC: 'LA',
    NCI: 'PT',
    SNOMEDCT_US: 'PT',
};
let _TGT: Promise<string> | undefined; // ticket granting ticket, use until it produces a bad ticket
let _getTicket: Promise<void> | undefined // use up ticket before getting another one, lock network timeout protected

setInterval(async () => {
    _TGT = undefined;
    await getTGT().catch(() => _TGT = undefined);
}, 60 * 60 * 6 * 1000);

function cleanupRejected(message: string) {
    return (error: Error) => {
        _TGT = undefined;
        consoleLog(`uts TGT failed: ${message} ${error}`);
        throw error;
    };
}

function checkForVsacErrorPage(body: string): string {
    if (body.indexOf('<html>') !== -1) {
        throw new Error('error response');
    }
    return body;
}

function getTGT(): Promise<string> {
    if (_TGT) {
        return _TGT;
    }
    if (!config.uts.apikey) {
        return Promise.reject('apikey is missing, will need that to log in');
    }
    return _TGT = fetch(config.uts.tgtUrl + '?apikey=' + config.uts.apikey, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(isStatus([201]))
        .then(text)
        .then(
            tgtHtml => {
                const re = RegExp(/api-key\/(TGT.*)" method.*/g);
                const tgtUrlMatches = re.exec(tgtHtml);
                return tgtUrlMatches ? tgtUrlMatches[1] : '';
            },
            cleanupRejected('get TGT ERROR')
        );
}

function getTicket<T>(cb: (ticket: string) => Promise<T>): Promise<T> {
    function fetchTicket() {
        return getTGT()
            .then(tgt => fetch(config.uts.tgtUrl + '/' + tgt + '?service=' + config.uts.service, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }));
    }

    return new Promise<T>((resolve) => {
        const _getTicketCurrent = _getTicket;
        _getTicket = new Promise<void>((resolveLock) => {
            Promise.resolve(_getTicketCurrent).then(() => {
                const ret = fetchTicket()
                    .then(res => {
                        if (res.status === 500) {
                            consoleLog('uts getTicket crashed, redo');
                            _TGT = undefined;
                            return fetchTicket();
                        }
                        return res;
                    })
                    .then(isStatus([200]))
                    .then(text)
                    .then(checkForVsacErrorPage, cleanupRejected('get ticket ERROR'))
                    .then(ticket => {
                        if (!ticket) {
                            throw 'ticket is missing';
                        }
                        return ticket;
                    })
                    .then(cb);

                let fetching = true;
                setTimeout(() => {
                    if (fetching) {
                        consoleLog('uts get ticket timeout, continuing with application');
                        fetching = false;
                        resolveLock();
                    }
                }, CONTINUE_TIMEOUT);
                ret
                    .catch(err => consoleLog('uts get ticket failed with ' + err.stack || err.message || err.publicMessage || err))
                    .finally(() => {
                        if (fetching) {
                            fetching = false;
                            resolveLock();
                        }
                    });

                resolve(ret);
            });
        });
    });
}

export function getValueSet(oid: string): Promise<string> {
    function fetchValueSet(): Promise<string> {
        return getTicket(ticket => fetch(`https://vsac.nlm.nih.gov/vsac/svs/RetrieveValueSet?id=${oid}&ticket=${ticket}`))
            .then(isStatus([200, 404]))
            .then(text)
            .then(checkForVsacErrorPage, cleanupRejected('get vsac set ERROR'));
    }

    return fetchValueSet()
        .then(xml => {
            if (xml === 'Unauthorized') {
                _TGT = undefined;
                consoleLog('uts getValueSet unauthorized redo')
                return fetchValueSet();
            }
            return xml;
        });
}

export function searchUmls(term: string): Promise<string> {
    return withRetry(() =>
        getTicket(ticket =>
            fetch(`${config.umls.wsHost}/rest/search/current?ticket=${ticket}&string=${term}`)
        )
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(cleanupRejected('reject searchUmls'))
    )
        .then(text)
        .then(checkForVsacErrorPage, cleanupRejected('get umls ERROR'));
}

export function getSourcePT(cui: string, src: string): Promise<string> {
    return withRetry(() =>
        getTicket(ticket =>
            fetch(`${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&ttys=${ttys[src]}&ticket=${ticket}`, {
                agent: httpsAgent,
            })
        )
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(cleanupRejected('reject getSourcePT'))
    )
        .then(isStatus([200]))
        .then(text)
        .then(checkForVsacErrorPage, cleanupRejected('get src PT from umls ERROR ' + `${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&ttys=${ttys[src]}&ticket=TTT`));
}

export function getAtomsFromUMLS(cui: string, src: string): Promise<string> {
    return withRetry(() =>
        getTicket(ticket =>
            fetch(`${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&pageSize=500&ticket=${ticket}`, {
                agent: httpsAgent,
            })
        )
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(cleanupRejected('reject getAtomsFromUMLS'))
    )
        .then(text)
        .then(checkForVsacErrorPage, cleanupRejected('get atoms from umls ERROR'));
}

export function umlsCuiFromSrc(id: string, src: string): Promise<string> {
    return withRetry(() =>
        getTicket(ticket =>
            fetch(`${config.umls.wsHost}/rest/search/current?string=${id}&searchType=exact`
                + `&inputType=sourceUi&sabs=${src}&includeObsolete=true&includeSuppressible=true&ticket=${ticket}`, {
                agent: httpsAgent,
            })
        )
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(cleanupRejected('reject umlsCuiFromSrc'))
    )
        .then(text)
        .then(checkForVsacErrorPage, cleanupRejected('get cui from src ERROR'));
}

export function searchBySystemAndCode(system: string, code: string): Promise<string> {
    return withRetry(() =>
        getTicket(ticket =>
            fetch(config.umls.wsHost + '/rest/content/current/source/' + system + '/' + code + '/atoms?ticket=' + ticket, {
                agent: httpsAgent,
            })
        )
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(cleanupRejected('reject searchBySystemAndCode'))
    )
        .then(text)
        .then(checkForVsacErrorPage, (err: Error) => {
            _TGT = undefined;
            respondError(err, {details: 'searchBySystemAndCode ERROR' + config.umls.wsHost + '/rest/content/current/source/' + system + '/' + code + '/atoms?ticket=TTT'});
            throw err;
        });
}
