import { promisify } from 'util';

const querystring = require('querystring');
const request = require('request').defaults({jar: true});
const config = require('config');

const dbLogger = require('../log/dbLogger');

function handleReject(message) {
    return error => {
        dbLogger.consoleLog(message + error);
        throw error;
    };
}

setInterval(async () => {
    await getTGT().catch(() => TGT = '');
    getVsacCookies();
}, 60 * 60 * 6 * 1000);

let TGT = '';

export let vsacCookies = [];

function getTGT() {
    let options = {
        uri: config.vsac.tgtUrl,
        method: 'POST',
        qs: {
            apikey: config.umls.apikey
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return promisify(request.post)(options)
        .then(response => {
            TGT = response.body.substr(response.body.indexOf(config.vsac.tgtUrl), response.body.length);
            TGT = TGT.substr(0, TGT.indexOf('"'));
        }, handleReject('get TGT ERROR'));
}

function getVsacCookies() {
    let options = {
        uri: 'https://vsac.nlm.nih.gov/vsac/login',
        body: querystring.stringify({
            username: config.vsac.username,
            password: config.vsac.password
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return promisify(request.post)(options)
        .then(response => {
                vsacCookies = response.headers['set-cookie'];
            },
            handleReject('get vsac cookies ERROR')
        );
}

async function getTicket() {
    if (!TGT.length) await getTGT();
    if (!TGT.length) throw 'no TGT';
    const options = {
        uri: TGT,
        qs: {
            service: config.uts.service
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return promisify(request.post)(options)
        .then(response => response.body,
            handleReject('get ticket ERROR')
        );

}

async function getRevision(oid, j) {
    let revisionOptions = {
        url: `https://vsac.nlm.nih.gov/vsac/pc/vs/valueset/${oid}/detail?label=Latest`,
        jar: j,
        method: 'GET'
    };
    return promisify(request.get)(revisionOptions)
        .then(response => {
                let result = JSON.parse(response.body);
                return result.revision;
            },
            handleReject('get revision ERROR')
        );

}

export async function searchValueSet(oid, term = '', page = '1') {
    let url = 'https://vsac.nlm.nih.gov/vsac/pc/code/codes';
    if (!vsacCookies.length) await getVsacCookies();
    const j = request.jar();
    vsacCookies.forEach(cookie => j.setCookie(request.cookie(cookie), url));

    return getRevision(oid, j).then(revision => {
        let queryTemplate = '{"_search":false,"rows":"120","page":"$page","sortName":"code","sortOrder":"asc","oid":"$oid","revision":"$revision","expRevision":null,"label":"Latest","effDate":null,"filters":"{\\"groupOp\\":\\"AND\\",\\"rules\\":[]}","filterFields":{"groupOp":"AND","rules":[]}}:';
        if (term) {
            queryTemplate = '{"_search":true,"rows":"120","page":"$page","sortName":"code","sortOrder":"asc","oid":"$oid","revision":"$revision","expRevision":null,"label":"Latest","effDate":null,"filters":"{\\"groupOp\\":\\"AND\\",\\"rules\\":[{\\"field\\":\\"displayname\\",\\"op\\":\\"cn\\",\\"data\\":\\"$term\\"}]}","filterFields":{"groupOp":"AND","rules":[{"field":"displayname","op":"cn","data":"$term"}]}}: ';
        }
        let query = queryTemplate.replace('$oid', oid)
            .replace('$page', page)
            .replace('$revision', revision)
            .replace(/\$term/g, term);
        let searchOptions = {
            url: url,
            jar: j,
            body: query,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        return promisify(request.post)(searchOptions).then(response => response.body, handleReject('get revision ERROR'));
    });
}

export function getValueSet(oid) {
    return getTicket().then(ticket => {
        let options = {
            uri: 'https://vsac.nlm.nih.gov/vsac/svs/RetrieveValueSet',
            qs: {
                id: oid,
                ticket
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        return promisify(request.get)(options)
            .then(response => response.body, handleReject('get vsac set ERROR'));
    });
}

export function searchUmls(term) {
    return getTicket().then(ticket => {
        let url = `${config.umls.wsHost}/rest/search/current?ticket=${ticket}&string=` + term;
        return promisify(request.get)({url, strictSSL: false})
            .then(response => response.body, handleReject('get umls ERROR'));
    });
}

export function getSourcePT (cui, src) {
    return getTicket().then(ticket => {
       let url = `${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${src}&ttys=PT&ticket=${ticket}`;
       console.log(url);
       return promisify(request.get)({url, strictSSL: false})
            .then(response => response.body, handleReject('get src PT from umls ERROR'));
    });
}

export function getAtomsFromUMLS(cui, source) {
    return getTicket().then(ticket => {
        let url = `${config.umls.wsHost}/rest/content/current/CUI/${cui}/atoms?sabs=${source}&pageSize=500&ticket=${ticket}`;
        return promisify(request.get)({url, strictSSL: false})
            .then(response => response.body, handleReject('get atoms from umls ERROR'));
    });
}

export function umlsCuiFromSrc(id, src) {
    return getTicket().then(ticket => {
        let url = `${config.umls.wsHost}/rest/search/current?string=${id}&searchType=exact&inputType=sourceUi&sabs=${src}`
            + `&includeObsolete=true&includeSuppressible=true&ticket=${ticket}`;
        return promisify(request.get)({url, strictSSL: false})
            .then(response => response.body, handleReject('get cui from src ERROR'));
    });
}
