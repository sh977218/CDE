const util = require('util');
const querystring = require('querystring');
const request = require('request').defaults({jar: true});
const config = require('config');

const dbLogger = require('../log/dbLogger.js');

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

TGT = '';

exports.vsacCookies = [];

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
    return util.promisify(request.post)(options)
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
    return util.promisify(request.post)(options)
        .then(response => {
                exports.vsacCookies = response.headers['set-cookie']
            },
            handleReject('get vsac cookies ERROR')
        );
}


async function getTicket() {
    if (!TGT.length) await getTGT().catch(() => TGT = '');
    const options = {
        uri: TGT,
        qs: {
            service: config.uts.service
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return util.promisify(request.post)(options)
        .then(response => response.body,
            handleReject('get ticket ERROR')
        );

}

async function getRevision(oid, j) {
    let revisionOptions = {
        url: 'https://vsac.nlm.nih.gov/vsac/pc/vs/valueset/' + oid + '/detail?label=Latest',
        jar: j,
        method: 'GET'
    };
    return util.promisify(request.get)(revisionOptions)
        .then(response => {
                let result = JSON.parse(response.body);
                return result.revision;
            },
            handleReject('get revision ERROR')
        );

}

exports.searchValueSet = async function (oid, term = '', page = '1') {
    let url = 'https://vsac.nlm.nih.gov/vsac/pc/code/codes';
    if (!exports.vsacCookies.length) await getVsacCookies();
    const j = request.jar();
    exports.vsacCookies.forEach(cookie => j.setCookie(request.cookie(cookie), url));

    let revision = await getRevision(oid, j);

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
    return util.promisify(request.post)(searchOptions)
        .then(response => response.body,
            handleReject('get revision ERROR'))
};

exports.getValueSet = async function (oid) {
    let ticket = await getTicket();
    let options = {
        uri: 'https://vsac.nlm.nih.gov/vsac/svs/RetrieveValueSet',
        qs: {
            id: oid,
            ticket: ticket
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return util.promisify(request.get)(options)
        .then(response => response.body,
            handleReject('get vsac set ERROR')
        );
};

exports.searchUmls = async function (term) {
    let ticket = await getTicket();
    let url = config.umls.wsHost + "/rest/search/current?ticket=" + ticket + "&string=" + term;
    let options = {url: url, strictSSL: false};
    return util.promisify(request.get)(options)
        .then(response => response.body,
            handleReject('get umls ERROR')
        );
};

exports.getCrossWalkingVocabularies = async function (source, code, targetSource) {
    let ticket = await getTicket();
    let url = config.umls.wsHost + "/rest/crosswalk/current/source/"
        + source + "/" + code + "?targetSource=" + targetSource
        + "&ticket=" + ticket;
    let options = {url: url, strictSSL: false};
    return util.promisify(request.get)(options)
        .then(response => response.body,
            handleReject('get cross walking vocabularies ERROR')
        );
};

exports.getAtomsFromUMLS = async function (cui, source) {
    let ticket = await getTicket();
    let url = config.umls.wsHost + "/rest/content/current/CUI/" + cui + "/atoms?sabs=" + source +
        "&pageSize=500&ticket=" + ticket;
    let options = {url: url, strictSSL: false};
    return util.promisify(request.get)(options)
        .then(response => response.body,
            handleReject('get atoms from umls ERROR')
        );
};

exports.umlsCuiFromSrc = async function (id, src) {
    let ticket = await getTicket();
    let url = config.umls.wsHost + "/rest/search/current?string=" + id +
        "&searchType=exact&inputType=sourceUi&sabs=" + src +
        "&includeObsolete=true&includeSuppressible=true&ticket=" + ticket;
    let options = {url: url, strictSSL: false};
    return util.promisify(request.get)(options)
        .then(response => response.body,
            handleReject('get cui from src ERROR')
        );
};
