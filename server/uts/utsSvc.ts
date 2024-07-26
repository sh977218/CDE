import { Dictionary } from 'async';
import { RequestInit } from 'node-fetch';
import { config } from 'server';
import { respondError } from 'server/errorHandler';
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
const ttys: Dictionary<string> = {
    LNC: 'LA',
    NCI: 'PT',
    SNOMEDCT_US: 'PT',
};

function logRejected(message: string) {
    return (error: Error) => {
        respondError({ details: 'UMLS failed: ' + message })(error);
        throw error;
    };
}

function checkForUtsErrorObj(obj: any) {
    if (obj.status && obj.name && obj.message) {
        console.log('checkForVsacErrorObj received Error object');
        throw obj;
    }
    return obj;
}

function checkForUtsErrorPage(body: string): string {
    if (body.indexOf('<html>') !== -1) {
        throw new Error('error response');
    }
    return body;
}

const { requestJson: umlsServerJson, requestText: umlsServerText } = serverRequest(config.umls.wsHost, 1, 5, 0);

export function umlsServerRequestJson<T>(path: string, options: RequestInit, okStatuses?: number[]): Promise<T> {
    return umlsServerJson<T>(path, options, okStatuses)
        .then(checkForUtsErrorObj)
        .catch(logRejected(`${config.umls.wsHost + path}`));
}

export function umlsServerRequestText(path: string, options?: RequestInit, okStatuses?: number[]): Promise<string> {
    return umlsServerText(path, options, okStatuses)
        .then(checkForUtsErrorPage)
        .catch(logRejected(`${config.umls.wsHost + path}`));
}

export function getSourcePT(cui: string, src: string): Promise<string> {
    return umlsServerRequestText(
        `/rest/content/current/CUI/${cui}/atoms?sabs=${src}&ttys=${ttys[src]}&apiKey=${config.uts.apikey}`
    );
}

export function getAtomsFromUMLS(cui: string, src: string): Promise<string> {
    return umlsServerRequestText(
        `/rest/content/current/CUI/${cui}/atoms?sabs=${src}&pageSize=500&apiKey=${config.uts.apikey}`
    );
}

export function searchBySystemAndCode(system: string, code: string): Promise<string> {
    // if system === 'UMLS', use `/content/current/CUI/${code}?apiKey=` possibly with '/atoms'
    // error on doc.suppressible || doc.obsolete
    // else
    return umlsServerRequestText(
        `/rest/content/current/source/${system}/${code}/atoms?apiKey=${config.uts.apikey}`,
        {},
        [200, 404]
    );
}

export function searchUmls(term: string): Promise<string> {
    return umlsServerRequestText(`/rest/search/current?apiKey=${config.uts.apikey}&string=${term}`);
}

export function umlsCuiFromSrc(id: string, src: string): Promise<string> {
    return umlsServerRequestText(
        `/rest/search/current?string=${id}&searchType=exact&inputType=sourceUi&sabs=${src}&includeObsolete=true&includeSuppressible=true&apiKey=${config.uts.apikey}`
    );
}
