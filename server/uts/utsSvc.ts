import { Dictionary } from 'async';
import { Agent } from 'https';
import fetch from 'node-fetch';
import { config } from 'server';
import { respondError } from 'server/errorHandler';
import { consoleLog } from 'server/log/dbLogger';
import { handleErrors, isStatus, text } from 'shared/fetch';
import { serverRequest } from 'shared/scheduling';

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
const httpsAgent = new Agent({
    rejectUnauthorized: false,
});
const ttys: Dictionary<string> = {
    LNC: 'LA',
    NCI: 'PT',
    SNOMEDCT_US: 'PT',
};

function logRejected(message: string) {
    return (error: Error) => {
        consoleLog(`UMLS failed: ${message} ${error}`);
        throw error;
    };
}

function checkForVsacErrorPage(body: string): string {
    if (body.indexOf('<html>') !== -1) {
        throw new Error('error response');
    }
    return body;
}

const umlsServerText = serverRequest(config.umls.wsHost).requestText;
export function umlsServerRequest(path: string): Promise<string> {
    return umlsServerText(path)
        .then(checkForVsacErrorPage, logRejected(''))
        .catch(logRejected(`${config.umls.wsHost + path}`));
}

export function getSourcePT(cui: string, src: string): Promise<string> {
    return fetch(`${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&ttys=${ttys[src]}&apiKey=${config.uts.apikey}`, {
                agent: httpsAgent,
            })
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(logRejected('reject getSourcePT'))
        .then(isStatus([200]))
        .then(text)
        .then(checkForVsacErrorPage, logRejected('get src PT from umls ERROR ' + `${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&ttys=${ttys[src]}&ticket=TTT`));
}

export function getAtomsFromUMLS(cui: string, src: string): Promise<string> {
    return fetch(`${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&pageSize=500&apiKey=${config.uts.apikey}`, {
                agent: httpsAgent,
            })
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(logRejected('reject getAtomsFromUMLS'))
        .then(text)
        .then(checkForVsacErrorPage, logRejected('get atoms from umls ERROR'));
}

export function umlsCuiFromSrc(id: string, src: string): Promise<string> {
    return fetch(`${config.umls.wsHost}/rest/search/current?string=${id}&searchType=exact`
                + `&inputType=sourceUi&sabs=${src}&includeObsolete=true&includeSuppressible=true&apiKey=${config.uts.apikey}`, {
                agent: httpsAgent,
            })
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(logRejected('reject umlsCuiFromSrc'))
        .then(text)
        .then(checkForVsacErrorPage, logRejected('get cui from src ERROR'));
}

export function searchBySystemAndCode(system: string, code: string): Promise<string> {
    return fetch(config.umls.wsHost + '/rest/content/current/source/' + system + '/' + code + '/atoms?apiKey=' + config.uts.apikey, {
                agent: httpsAgent,
            })
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(logRejected('reject searchBySystemAndCode'))
        .then(text)
        .then(checkForVsacErrorPage, (err: Error) => {
            respondError({details: 'searchBySystemAndCode ' + config.umls.wsHost + '/rest/content/current/source/'
                    + system + '/' + code + '/atoms?ticket=TTT'})(err);
            throw err;
        });
}
