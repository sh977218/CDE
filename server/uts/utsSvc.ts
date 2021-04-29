import { Dictionary } from 'async';
import * as Config from 'config';
import { Agent } from 'https';
import fetch from 'node-fetch';
import { respondError } from 'server/errorHandler/errorHandler';
import { consoleLog } from 'server/log/dbLogger';
import { text } from 'shared/fetch';

export const config = Config as any;

const ttys: Dictionary<string> = {
    LNC: 'LA',
    NCI: 'PT',
    SNOMEDCT_US: 'PT',
};

function handleReject(message: string) {
    return (error: Error) => {
        _TGT = undefined;
        consoleLog(message + error);
        throw error;
    };
}

setInterval(async () => {
    _TGT = undefined;
    await getTGT().catch(() => _TGT = undefined);
}, 60 * 60 * 6 * 1000);

let _TGT: Promise<string> | undefined; // TGT string is tgtUrl + '/' + TGTCode

export let _vsacCookies: Promise<string[]> | undefined;

function checkForVsacErrorPage(body: string): string {
    if (body.indexOf('<html>') !== -1) {
        throw new Error('error response');
    }
    return body;
}

function getTGT() {
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
        .then(text)
        .then(
            tgtHtml => {
                const re = RegExp(/api-key\/(TGT.*)" method.*/g);
                const tgtUrlMatches = re.exec(tgtHtml);
                return tgtUrlMatches ? tgtUrlMatches[1] : '';
            },
            handleReject('get TGT ERROR')
        );
}

function getTicket(): Promise<string> {
    return getTGT()
        .then(tgt => fetch(config.uts.tgtUrl + '/' + tgt + '?service=' + config.uts.service, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }))
        .then(text)
        .then(checkForVsacErrorPage, handleReject('get ticket ERROR'));
}

export function getValueSet(oid: string): Promise<string> {
    return getTicket()
        .then(ticket => fetch(`https://vsac.nlm.nih.gov/vsac/svs/RetrieveValueSet?id=${oid}&ticket=${ticket}`))
        .then(text)
        .then(checkForVsacErrorPage, handleReject('get vsac set ERROR'));
}

export function searchUmls(term: string): Promise<string> {
    return getTicket()
        .then(ticket => fetch(`${config.umls.wsHost}/rest/search/current?ticket=${ticket}&string=${term}`))
        .then(text)
        .then(checkForVsacErrorPage, handleReject('get umls ERROR'));
}

const httpsAgent = new Agent({
    rejectUnauthorized: false,
});

export function getSourcePT(cui: string, src: string): Promise<string> {
    return getTicket()
        .then(ticket => fetch(
            `${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&ttys=${ttys[src]}&ticket=${ticket}`,
            {
                agent: httpsAgent,
            }
        ))
        .then(text)
        .then(checkForVsacErrorPage, handleReject('get src PT from umls ERROR'));
}

export function getAtomsFromUMLS(cui: string, source: string): Promise<string> {
    return getTicket()
        .then(ticket => fetch(`${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${source}&pageSize=500&ticket=${ticket}`, {
            agent: httpsAgent,
        }))
        .then(text)
        .then(checkForVsacErrorPage, handleReject('get atoms from umls ERROR'));
}

export function umlsCuiFromSrc(id: string, src: string): Promise<string> {
    return getTicket()
        .then(ticket => fetch(`${config.umls.wsHost}/rest/search/current?string=${id}&searchType=exact&inputType=sourceUi&sabs=${src}`
            + `&includeObsolete=true&includeSuppressible=true&ticket=${ticket}`, {
            agent: httpsAgent,
        }))
        .then(text)
        .then(checkForVsacErrorPage, handleReject('get cui from src ERROR'));
}

export function searchBySystemAndCode(system: string, code: string): Promise<string> {
    return getTicket()
        .then(ticket => fetch(config.umls.wsHost + '/rest/content/current/source/' + system + '/' + code + '/atoms?ticket=' + ticket, {
            agent: httpsAgent,
        }))
        .then(text)
        .then(checkForVsacErrorPage, (err: Error) => {
                _TGT = undefined;
                respondError(err, {details: 'get umls ERROR'});
                throw err;
            }
        );
}

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
