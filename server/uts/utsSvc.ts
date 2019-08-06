import * as Config from 'config';
import { stringify } from 'querystring';
import { promisify } from 'util';
import { respondError } from 'server/errorHandler/errorHandler';
import { consoleLog } from 'server/log/dbLogger';

const request = require('request').defaults({jar: true});

export const config = Config as any;

const ttys = {
    LNC: 'LA',
    NCI: 'PT',
    SNOMEDCT_US: 'PT',
};

function handleReject(message) {
    return error => {
        _TGT = undefined;
        consoleLog(message + error);
        throw error;
    };
}

setInterval(async () => {
    await getTGT().catch(() => _TGT = undefined);
    getVsacCookies().catch(handleReject('get vsac cookies ERROR'));
}, 60 * 60 * 6 * 1000);

let _TGT: Promise<string> | undefined = undefined; // TGT string is tgtUrl + '/' + TGTCode

export let _vsacCookies: Promise<any[]> | undefined = undefined;

function getTGT() {
    if (_TGT) {
        return _TGT;
    }
    return _TGT = promisify(request.post)({
        uri: config.vsac.tgtUrl,
        method: 'POST',
        qs: {
            username: config.vsac.username,
            password: config.vsac.password
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(
            response => response.body,
            handleReject('get TGT ERROR')
        );
}

function getVsacCookies() {
    if (_vsacCookies) {
        return _vsacCookies;
    }
    return _vsacCookies = promisify(request.post)({
        uri: 'https://vsac.nlm.nih.gov/vsac/login',
        body: stringify({
            username: config.vsac.username,
            password: config.vsac.password
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(
            response => response.headers['set-cookie'],
            handleReject('get vsac cookies ERROR')
        );
}

function getTicket() {
    return getTGT()
        .then(tgt => promisify(request.post)({
            uri: config.vsac.tgtUrl + '/' + tgt,
            qs: {
                service: config.uts.service
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }))
        .then(
            response => response.body,
            handleReject('get ticket ERROR')
        );
}

function getRevision(oid, j) {
    return promisify(request.get)({
        uri: `https://vsac.nlm.nih.gov/vsac/pc/vs/valueset/${oid}/detail?label=Latest`,
        jar: j,
        method: 'GET'
    })
        .then(
            response => JSON.parse(response.body).revision,
            handleReject('get revision ERROR')
        );

}

export function searchValueSet(oid, term = '', page = '1') {
    let uri = 'https://vsac.nlm.nih.gov/vsac/pc/code/codes';
    return getVsacCookies()
        .then(vsacCookies => {
            const j = request.jar();
            vsacCookies.forEach(cookie => j.setCookie(request.cookie(cookie), uri));
            return j;
        })
        .then(j => {
            return getRevision(oid, j)
                .then(revision => promisify(request.post)({
                    uri,
                    jar: j,
                    body: (term
                            ? '{"_search":true,"rows":"120","page":"$page","sortName":"code","sortOrder":"asc","oid":"$oid","revision":"$revision","expRevision":null,"label":"Latest","effDate":null,"filters":"{\\"groupOp\\":\\"AND\\",\\"rules\\":[{\\"field\\":\\"displayname\\",\\"op\\":\\"cn\\",\\"data\\":\\"$term\\"}]}","filterFields":{"groupOp":"AND","rules":[{"field":"displayname","op":"cn","data":"$term"}]}}: '
                            : '{"_search":false,"rows":"120","page":"$page","sortName":"code","sortOrder":"asc","oid":"$oid","revision":"$revision","expRevision":null,"label":"Latest","effDate":null,"filters":"{\\"groupOp\\":\\"AND\\",\\"rules\\":[]}","filterFields":{"groupOp":"AND","rules":[]}}:'
                    )
                        .replace('$oid', oid)
                        .replace('$page', page)
                        .replace('$revision', revision)
                        .replace(/\$term/g, term),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }))
                .then(
                    response => response.body,
                    handleReject('get revision ERROR')
                );
        });
}

export function getValueSet(oid) {
    return getTicket()
        .then(ticket => promisify(request.get)({
            uri: 'https://vsac.nlm.nih.gov/vsac/svs/RetrieveValueSet',
            qs: {
                id: oid,
                ticket
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }))
        .then(
            response => response.body,
            handleReject('get vsac set ERROR')
        );
}

export function searchUmls(term) {
    return getTicket()
        .then(ticket => promisify(request.get)({
            strictSSL: false,
            uri: `${config.umls.wsHost}/rest/search/current?ticket=${ticket}&string=${term}`
        }))
        .then(
            response => response.body,
            handleReject('get umls ERROR')
        )
}

export function getSourcePT(cui, src) {
    return getTicket()
        .then(ticket => promisify(request.get)({
            uri: `${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&ttys=${ttys[src]}&ticket=${ticket}`,
            strictSSL: false
        }))
        .then(
            response => response.body,
            handleReject('get src PT from umls ERROR')
        );
}

export function getAtomsFromUMLS(cui, source) {
    return getTicket()
        .then(ticket => promisify(request.get)({
            strictSSL: false,
            uri: `${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${source}&pageSize=500&ticket=${ticket}`
        }))
        .then(
            response => response.body,
            handleReject('get atoms from umls ERROR')
        );
}

export function umlsCuiFromSrc(id, src) {
    return getTicket()
        .then(ticket => promisify(request.get)({
            strictSSL: false,
            uri: `${config.umls.wsHost}/rest/search/current?string=${id}&searchType=exact&inputType=sourceUi&sabs=${src}`
                + `&includeObsolete=true&includeSuppressible=true&ticket=${ticket}`
        }))
        .then(
            response => response.body,
            handleReject('get cui from src ERROR')
        );
}

export function searchBySystemAndCode(system, code) {
    return getTicket()
        .then(ticket => promisify(request.get)({
            strictSSL: false,
            uri: config.umls.wsHost + '/rest/content/current/source/' + system + '/' + code + '/atoms?ticket=' + ticket,
        }))
        .then(response => response.body,
            err => {
                _TGT = undefined;
                respondError(err, {details: 'get umls ERROR'});
                throw err;
            }
        );
}

export const CDE_SYSTEM_TO_UMLS_SYSTEM_MAP = {
    'LOINC': 'LNC',
    'NCI Thesaurus': 'NCI',
    'SNOMEDCT US': 'SNOMEDCT_US',
    'UMLS': 'UMLS',
    'AHRQ Common Formats': '',
    'CDCREC': '',
    'HL7 Administrative Gender': '',
    'HL7 NullFlavor': '',
    'ICD9CM': '',
    'ICD10CM': '',
    'OBI': '',
    'SNOMED': '',
    'SNOMED CT': '',
    'SNOMEDCT': '',
};