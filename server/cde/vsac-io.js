const https = require('https');
const querystring = require('querystring');
const config = require('config');
const request = require('request');

const dbLogger = require('../log/dbLogger.js');

const authData = querystring.stringify({
    username: config.vsac.username,
    password: config.vsac.password
});
const ticketData = querystring.stringify({
    service: config.uts.service
});
const tgtOptions = {
    host: config.vsac.host,
    hostname: config.vsac.host,
    port: config.vsac.port,
    path: config.vsac.ticket.path,
    method: 'POST',
    agent: false,
    requestCert: true,
    rejectUnauthorized: false,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': authData.length
    }
};
const ticketOptions = {
    host: config.vsac.host,
    hostname: config.vsac.host,
    port: config.vsac.port,
    path: config.vsac.ticket.path,
    method: 'POST',
    requestCert: true,
    agent: false,
    rejectUnauthorized: false,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': ticketData.length
    }
};

// const valueSetOptions = {
//     host: config.vsac.host,
//     port: config.vsac.port,
//     path: config.vsac.valueSet.path,
//     method: 'GET',
//     agent: false,
//     requestCert: true,
//     rejectUnauthorized: false
// };

exports.getTGT = function (retries, cb) {
    function retry(retries, cb) {
        if (retries) {
            setTimeout(exports.getTGT, 6000, --retries, cb);
            return;
        }
        dbLogger.consoleLog('getTgt: ERROR TIMEDOUT: check credentials');
    }
    let req = https.request(tgtOptions, function (res) {
        let output = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            if (!output) {
                retry(retries, cb);
                return;
            }
            ticketOptions.path = config.vsac.ticket.path + '/' + output;
            if (cb) cb(output);
        });
    });

    req.on('error', function (e) {
        dbLogger.consoleLog('getTgt: ERROR with request: ' + e, 'error');
        retry(retries, cb);
    });

    req.write(authData);
    req.end();
};

exports.getTicket = function (retries, cb) {
    function retry(retries, cb) {
        if (retries) {
            exports.getTGT(0, () => exports.getTicket(--retries, cb));
            return;
        }
        dbLogger.consoleLog('getTicket: ERROR TIMEDOUT: no tgt');
    }
    let req = https.request(ticketOptions, function (res) {
        let output = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            if (output.indexOf('"error":"Not Found"') > -1) {
                dbLogger.consoleLog('getTicket: ERROR 404');
                retry(retries, cb);
                return;
            }
            cb(output);
        });
    });

    req.on('error', function (e) {
        dbLogger.consoleLog('getTicket: ERROR with request ' + e, 'error');
        retry(retries, cb);
    });

    req.write(ticketData);
    req.end();
};

exports.getValueSet = function (oid, cb) {
    this.getTicket(1, vsacTicket => {
        request({url: "https://vsac.nlm.nih.gov/vsac/svs/RetrieveValueSet" + "?id="
            + oid + "&ticket=" + vsacTicket, strictSSL: false}, cb);
    });
};

exports.getAtomsFromUMLS = function (cui, source, res) {
    this.getTicket(1, function (oneTimeTicket) {
        let url = config.umls.wsHost + "/rest/content/current/CUI/" + cui + "/atoms?sabs=" + source +
            "&pageSize=500&ticket=" + oneTimeTicket;
        request({url: url, strictSSL: false}, function (err, response, body) {
            if (!err && response.statusCode === 200) res.send(body);
            else {
                res.send();
            }
        });
    });
};

exports.umlsCuiFromSrc = function (id, src, res) {
    this.getTicket(1, function (oneTimeTicket) {
        let url = config.umls.wsHost + "/rest/search/current?string=" + id +
            "&searchType=exact&inputType=sourceUi&sabs=" + src +
            "&includeObsolete=true&includeSuppressible=true&ticket=" + oneTimeTicket;
        request.get({url: url, strictSSL: false}).pipe(res);
    });
};

exports.searchUmls = function (term, res) {
    this.getTicket(1, (oneTimeTicket) => {
        let url = config.umls.wsHost + "/rest/search/current?ticket=" +
            oneTimeTicket + "&string=" + term;
        request.get({url: url, strictSSL: false}).pipe(res);
    });
};

exports.getCrossWalkingVocabularies = function (source, code, targetSource, cb) {
    this.getTicket(1, function (oneTimeTicket) {
        let url = config.umls.wsHost + "/rest/crosswalk/current/source/"
            + source + "/" + code + "?targetSource=" + targetSource
            + "&ticket=" + oneTimeTicket;
        request({url: url, strictSSL: false}, function (err, response) {
            cb(err, response);
        });
    });
};
