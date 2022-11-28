import { Dictionary } from 'async';
import { Agent } from 'https';
import fetch from 'node-fetch';
import { config } from 'server';
import { respondError } from 'server/errorHandler';
import { consoleLog } from 'server/log/dbLogger';
import { handleErrors, isStatus, text } from 'shared/fetch';

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

function cleanupRejected(message: string) {
    return (error: Error) => {
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

export function searchUmls(term: string): Promise<string> {
    return fetch(`${config.umls.wsHost}/rest/search/current?apiKey=${config.uts.apikey}&string=${term}`)
        .then(handleErrors)
        .then(isStatus([200]))
        .catch(cleanupRejected('reject searchUmls'))
        .then(text)
        .then(checkForVsacErrorPage, cleanupRejected('get umls ERROR'));
}

export function getSourcePT(cui: string, src: string): Promise<string> {
    return fetch(`${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&ttys=${ttys[src]}&apiKey=${config.uts.apikey}`, {
                agent: httpsAgent,
            })
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(cleanupRejected('reject getSourcePT'))
        .then(isStatus([200]))
        .then(text)
        .then(checkForVsacErrorPage, cleanupRejected('get src PT from umls ERROR ' + `${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&ttys=${ttys[src]}&ticket=TTT`));
}

export function getAtomsFromUMLS(cui: string, src: string): Promise<string> {
    return fetch(`${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&pageSize=500&apiKey=${config.uts.apikey}`, {
                agent: httpsAgent,
            })
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(cleanupRejected('reject getAtomsFromUMLS'))
        .then(text)
        .then(checkForVsacErrorPage, cleanupRejected('get atoms from umls ERROR'));
}

export function umlsCuiFromSrc(id: string, src: string): Promise<string> {
    return fetch(`${config.umls.wsHost}/rest/search/current?string=${id}&searchType=exact`
                + `&inputType=sourceUi&sabs=${src}&includeObsolete=true&includeSuppressible=true&apiKey=${config.uts.apikey}`, {
                agent: httpsAgent,
            })
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(cleanupRejected('reject umlsCuiFromSrc'))
        .then(text)
        .then(checkForVsacErrorPage, cleanupRejected('get cui from src ERROR'));
}

export function searchBySystemAndCode(system: string, code: string): Promise<string> {
    return fetch(config.umls.wsHost + '/rest/content/current/source/' + system + '/' + code + '/atoms?apiKey=' + config.uts.apikey, {
                agent: httpsAgent,
            })
            .then(handleErrors)
            .then(isStatus([200]))
            .catch(cleanupRejected('reject searchBySystemAndCode'))
        .then(text)
        .then(checkForVsacErrorPage, (err: Error) => {
            respondError({details: 'searchBySystemAndCode ' + config.umls.wsHost + '/rest/content/current/source/'
                    + system + '/' + code + '/atoms?ticket=TTT'})(err);
            throw err;
        });
}
