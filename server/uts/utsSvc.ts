import { Dictionary } from 'async';
import * as Config from 'config';
import { cookie, CookieJar, CoreOptions, get, jar, post, Response, UriOptions } from 'request';
import { respondError } from 'server/errorHandler/errorHandler';
import { consoleLog } from 'server/log/dbLogger';
import { promisify } from 'util';

export const config = Config as any;

const ttys: Dictionary<string> = {
    LNC: 'LA',
    NCI: 'PT',
    SNOMEDCT_US: 'PT',
};

function utsFake200Handler(response: Response) {
    if (verifyUMLS200(response)) {
        return response.body;
    } else {
        handleReject('get revision ERROR');
    }
}

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
    getVsacCookies().catch(handleReject('get vsac cookies ERROR'));
}, 60 * 60 * 6 * 1000);

let _TGT: Promise<string> | undefined; // TGT string is tgtUrl + '/' + TGTCode

export let _vsacCookies: Promise<string[]> | undefined;

function getTGT() {
    if (_TGT) {
        return _TGT;
    }
    if (!config.uts.apikey) {
        return Promise.reject('apikey is missing, will need that to log in');
    }
    return _TGT = promisify<UriOptions & CoreOptions, Response>(post)({
        uri: config.uts.tgtUrl,
        method: 'POST',
        qs: {
            apikey: config.uts.apikey
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(
        response => {
            const tgtHtml = response.body;
            const re = RegExp(/api-key\/(TGT.*)" method.*/g);
            const tgtUrlMatches = re.exec(tgtHtml);
            return tgtUrlMatches ? tgtUrlMatches[1] : '';
        },
        handleReject('get TGT ERROR')
    );
}

function verifyUMLS200(response: Response) {
    return !!response.body && response.body.indexOf('<html>') === -1;
}

function getVsacCookies(): Promise<string[]> {
    if (_vsacCookies) {
        return _vsacCookies;
    }
    return _vsacCookies = promisify<UriOptions & CoreOptions, Response>(post)({
        uri: 'https://vsac.nlm.nih.gov/vsac/login',
        // body: stringify({
        //     username: config.vsac.username,
        //     password: config.vsac.password
        // }),
        body: `username=${config.vsac.username}&password=${config.vsac.password}`,
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(
        response => response.headers['set-cookie'] || [],
        handleReject('get vsac cookies ERROR')
    );
}

function getTicket(): Promise<string> {
    return getTGT()
        .then(tgt => promisify<UriOptions & CoreOptions, Response>(post)({
            uri: config.uts.tgtUrl + '/' + tgt,
            qs: {
                service: config.uts.service
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }))
        .then(utsFake200Handler, handleReject('get ticket ERROR'));
}

function getRevision(oid: string, j: CookieJar): Promise<string> {
    return promisify<UriOptions & CoreOptions, Response>(get)({
        uri: `https://vsac.nlm.nih.gov/vsac/pc/vs/valueset/${oid}/detail?label=Latest`,
        jar: j,
        method: 'GET'
    }).then(
        (response: Response) => {
            return JSON.parse(response.body).revision;
        },
        handleReject('get revision ERROR')
    );

}

export function searchValueSet(oid: string, term = '', page = '1') {
    const uri = 'https://vsac.nlm.nih.gov/vsac/pc/code/codes';
    return getVsacCookies()
        .then(vsacCookies => {
            const j = jar();
            vsacCookies.forEach(cookieString => {
                const c = cookie(cookieString);
                if (c) {
                    j.setCookie(c, uri);
                }
            });
            return j;
        })
        .then(j => {
            return getRevision(oid, j)
                .then(revision => promisify<UriOptions & CoreOptions, Response>(post)({
                    uri,
                    jar: j,
                    body: (term
                            /* tslint:disable */
                            ? '{"_search":true,"rows":"120","page":"$page","sortName":"code","sortOrder":"asc","oid":"$oid","revision":"$revision","expRevision":null,"label":"Latest","effDate":null,"filters":"{\\"groupOp\\":\\"AND\\",\\"rules\\":[{\\"field\\":\\"displayname\\",\\"op\\":\\"cn\\",\\"data\\":\\"$term\\"}]}","filterFields":{"groupOp":"AND","rules":[{"field":"displayname","op":"cn","data":"$term"}]}}: '
                            : '{"_search":false,"rows":"120","page":"$page","sortName":"code","sortOrder":"asc","oid":"$oid","revision":"$revision","expRevision":null,"label":"Latest","effDate":null,"filters":"{\\"groupOp\\":\\"AND\\",\\"rules\\":[]}","filterFields":{"groupOp":"AND","rules":[]}}:'
                            /* tslint:enable */
                    )
                        .replace('$oid', oid)
                        .replace('$page', page)
                        .replace('$revision', revision)
                        .replace(/\$term/g, term),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }))
                .then(utsFake200Handler, handleReject('get revision ERROR'));
        });
}

export function getValueSet(oid: string) {
    return getTicket()
        .then(ticket => promisify<UriOptions & CoreOptions, Response>(get)({
            uri: `https://vsac.nlm.nih.gov/vsac/svs/RetrieveValueSet?id=${oid}&ticket=${ticket}`,
        }))
        .then(utsFake200Handler, handleReject('get vsac set ERROR'));
}

export function searchUmls(term: string) {
    return getTicket()
        .then(ticket => promisify<UriOptions & CoreOptions, Response>(get)({
            uri: `${config.umls.wsHost}/rest/search/current?ticket=${ticket}&string=${term}`
        })).then(utsFake200Handler, handleReject('get umls ERROR'));
}

export function getSourcePT(cui: string, src: string) {
    return getTicket()
        .then(ticket => promisify<UriOptions & CoreOptions, Response>(get)({
            uri: `${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&ttys=${ttys[src]}&ticket=${ticket}`,
            strictSSL: false
        }))
        .then(utsFake200Handler, handleReject('get src PT from umls ERROR'));
}

export function getAtomsFromUMLS(cui: string, source: string) {
    return getTicket()
        .then(ticket => promisify<UriOptions & CoreOptions, Response>(get)({
            strictSSL: false,
            uri: `${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${source}&pageSize=500&ticket=${ticket}`
        }))
        .then(utsFake200Handler, handleReject('get atoms from umls ERROR'));
}

export function umlsCuiFromSrc(id: string, src: string) {
    return getTicket()
        .then(ticket => promisify<UriOptions & CoreOptions, Response>(get)({
            strictSSL: false,
            uri: `${config.umls.wsHost}/rest/search/current?string=${id}&searchType=exact&inputType=sourceUi&sabs=${src}`
                + `&includeObsolete=true&includeSuppressible=true&ticket=${ticket}`
        }))
        .then(utsFake200Handler, handleReject('get cui from src ERROR'));
}

export function searchBySystemAndCode(system: string, code: string) {
    return getTicket()
        .then(ticket => promisify<UriOptions & CoreOptions, Response>(get)({
            strictSSL: false,
            uri: config.umls.wsHost + '/rest/content/current/source/' + system + '/' + code + '/atoms?ticket=' + ticket,
        }))
        .then(utsFake200Handler, (err: Error) => {
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
