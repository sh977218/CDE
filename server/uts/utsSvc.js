const querystring = require('querystring');
const request = require('request').defaults({jar: true});
const config = require('config');

const dbLogger = require('../log/dbLogger.js');

setInterval(() => {
    getTGT();
    getVsacCookies();
}, 60 * 60 * 6 * 1000);

TGT = '';

exports.vsacCookies = [];

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
    return new Promise((resolve, reject) => {
        request.post(options, function (error, response, body) {
            if (error) {
                dbLogger.appLogs('get vsac cookies ERROR: ' + error);
                reject(error);
            } else {
                let setCookie = response.headers['set-cookie'];
                exports.vsacCookies = setCookie;
                resolve();
            }
        })
    })
}

function getTGT() {
    let tgtOptions = {
        uri: config.vsac.tgtUrl,
        method: 'POST',
        qs: {
            username: config.vsac.username,
            password: config.vsac.password
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return new Promise((resolve, reject) => {
        request(tgtOptions, function (error, response, body) {
            if (error) {
                TGT = '';
                dbLogger.appLogs('get TGT ERROR: ' + error);
                reject(error);
            } else {
                TGT = body;
                resolve();
            }
        })
    })
};

async function getTicket() {
    if (!TGT.length) await getTGT();
    const ticketOptions = {
        uri: config.vsac.tgtUrl + '/' + TGT,
        method: 'POST',
        qs: {
            service: config.uts.service
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return new Promise((resolve, reject) => {
        request(ticketOptions, function (error, response, body) {
            if (error) {
                dbLogger.appLogs('get ticket ERROR: ' + error);
                reject(error);
            } else {
                resolve(body);
            }
        })
    })
}

exports.searchValueSet = async function (oid, term = '', page = 1) {
    let url = 'https://vsac.nlm.nih.gov/vsac/pc/code/codes';
    if (!exports.vsacCookies.length) await getVsacCookies();
    const j = request.jar();
    exports.vsacCookies.forEach(cookie => {
        j.setCookie(request.cookie(cookie), url);
    });

    let queryTemplate = '{"_search":false,"rows":"120","page":"$page","sortName":"code","sortOrder":"asc","oid":"$oid","revision":"$revision","expRevision":null,"label":"Latest","effDate":null,"filters":"{\\"groupOp\\":\\"AND\\",\\"rules\\":[]}","filterFields":{"groupOp":"AND","rules":[]}}:';
    if (term) {
        queryTemplate = '{"_search":true,"rows":"120","page":"$page","sortName":"code","sortOrder":"asc","oid":"$oid","revision":"$revision","expRevision":null,"label":"Latest","effDate":null,"filters":"{\\"groupOp\\":\\"AND\\",\\"rules\\":[{\\"field\\":\\"displayname\\",\\"op\\":\\"cn\\",\\"data\\":\\"$term\\"}]}","filterFields":{"groupOp":"AND","rules":[{"field":"displayname","op":"cn","data":"$term"}]}}: ';
    }
    return new Promise((resolve, reject) => {
        let revisionOptions = {
            url: 'https://vsac.nlm.nih.gov/vsac/pc/vs/valueset/' + oid + '/detail?label=Latest',
            jar: j,
            method: 'GET'
        };
        request(revisionOptions, function (error, response, body) {
            if (error) {
                dbLogger.appLogs('get revision ERROR: ' + error);
                reject(error);
            } else {
                let result = JSON.parse(body);
                let revision = result.revision;
                let query = queryTemplate.replace('$oid', oid).replace('$page', page).replace('$revision', revision).replace(/\$term/g, term);
                let searchOptions = {
                    url: url,
                    jar: j,
                    method: 'POST',
                    body: query,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };
                request(searchOptions, function (error, response, body) {
                    if (error) {
                        dbLogger.appLogs('search value set ERROR: ' + error);
                        reject(error);
                    } else {
                        resolve(body);
                    }
                })
            }
        })
    });
};
exports.getValueSet = function (oid) {
    return new Promise(async (resolve, reject) => {
        let ticket = await getTicket();
        let valueSetOptions = {
            uri: 'https://vsac.nlm.nih.gov/vsac/svs/RetrieveValueSet',
            qs: {
                id: oid,
                ticket: ticket
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        request.get(valueSetOptions, function (error, response, body) {
            if (error) {
                dbLogger.appLogs('get value set ERROR: ' + error);
                reject(error);
            } else {
                resolve(body);
            }
        });
    })
};

exports.searchUmls = function (term) {
    return new Promise(async (resolve, reject) => {
        let ticket = await getTicket();
        let url = config.umls.wsHost + "/rest/search/current?ticket=" + ticket + "&string=" + term;
        request.get({url: url, strictSSL: false}, function (error, response, body) {
            if (error) {
                dbLogger.appLogs('search umls ERROR: ' + error);
                reject(error);
            } else {
                resolve(body);
            }
        });
    })
};

exports.getCrossWalkingVocabularies = function (source, code, targetSource) {
    return new Promise(async (resolve, reject) => {
        let ticket = await getTicket();
        let url = config.umls.wsHost + "/rest/crosswalk/current/source/"
            + source + "/" + code + "?targetSource=" + targetSource
            + "&ticket=" + ticket;
        request({url: url, strictSSL: false}, function (error, response, body) {
            if (error) {
                dbLogger.appLogs('get cross walking vocabularies ERROR: ' + error);
                reject(error);
            } else {
                resolve(body);
            }
        });
    })
};

exports.getAtomsFromUMLS = function (cui, source) {
    return new Promise(async (resolve, reject) => {
        let ticket = await getTicket();
        let url = config.umls.wsHost + "/rest/content/current/CUI/" + cui + "/atoms?sabs=" + source +
            "&pageSize=500&ticket=" + ticket;
        request({url: url, strictSSL: false}, function (err, response, body) {
            if (err) {
                dbLogger.appLogs('get atoms from umls ERROR: ' + error);
                reject(error);
            } else {
                resolve(body);
            }
        });
    })
};

exports.umlsCuiFromSrc = function (id, src, res) {
    return new Promise(async (resolve, reject) => {
        let ticket = await getTicket();
        let url = config.umls.wsHost + "/rest/search/current?string=" + id +
            "&searchType=exact&inputType=sourceUi&sabs=" + src +
            "&includeObsolete=true&includeSuppressible=true&ticket=" + ticket;
        request({url: url, strictSSL: false}, function (err, response, body) {
            if (err) {
                dbLogger.appLogs('umls cui from src ERROR: ' + err);
                reject(err);
            } else {
                resolve(body);
            }
        });
    })
};
