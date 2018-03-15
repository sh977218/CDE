const https = require('https');
const querystring = require('querystring');
const config = require('config');
const request = require('request');

const dbLogger = require('../system/dbLogger.js');

const authData = querystring.stringify({
    username: config.vsac.username
    , password: config.vsac.password + "."
});

const ticketData = querystring.stringify({
    service: config.uts.service
});

const vsacHost = config.vsac.host;
const vsacPort = config.vsac.port;

const tgtOptions = {
    host: vsacHost,
    hostname: vsacHost,
    port: vsacPort,
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
    host: vsacHost,
    hostname: vsacHost,
    port: vsacPort,
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

const valueSetOptions = {
    host: vsacHost,
    port: vsacPort,
    path: config.vsac.valueSet.path,
    method: 'GET',
    agent: false,
    requestCert: true,
    rejectUnauthorized: false
};

let vsacTGT = '';

exports.getTGT = function (cb) {
    let req = https.request(tgtOptions, function (res) {
        let output = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            vsacTGT = output;
            ticketOptions.path = config.vsac.ticket.path + '/' + vsacTGT;
            if (cb) cb(vsacTGT);
        });
    });

    req.on('error', function (e) {
        dbLogger.consoleLog('getTgt: ERROR with request: ' + e, 'error');
    });

    req.write(authData);
    req.end();
};

exports.getTicket = function (cb) {
    let req = https.request(ticketOptions, function (res) {
        let output = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            cb(output);
        });
    });

    req.on('error', function (e) {
        dbLogger.consoleLog('getTicket: ERROR with request ' + e, 'error');
    });

    req.write(ticketData);
    req.end();
};

exports.getValueSet = function (oid, cb) {
    this.getTicket(function (vsacTicket) {
        let url = "https://vsac.nlm.nih.gov/vsac/svs/RetrieveValueSet" + "?id=" + oid + "&ticket=" + vsacTicket;
        request({url: url, strictSSL: false}, function (err, response) {
            cb(err, response);
        });
    });
};

exports.getAtomsFromUMLS = function (cui, source, res) {
    this.getTicket(function (oneTimeTicket) {
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
    this.getTicket(function (oneTimeTicket) {
        let url = config.umls.wsHost + "/rest/search/current?string=" + id +
            "&searchType=exact&inputType=sourceUi&sabs=" + src + "&ticket=" + oneTimeTicket;
        request.get({url: url, strictSSL: false}).pipe(res);
    });
};

exports.searchUmls = function (term, res) {
    this.getTicket((oneTimeTicket) => {
        let url = config.umls.wsHost + "/rest/search/current?ticket=" +
            oneTimeTicket + "&string=" + term;
        request.get({url: url, strictSSL: false}).pipe(res);
    });
};

exports.getCrossWalkingVocabularies = function (source, code, targetSource, cb) {
    this.getTicket(function (oneTimeTicket) {
        let url = "https://uts-ws.nlm.nih.gov/rest/crosswalk/current/source/"
            + source + "/" + code + "?targetSource=" + targetSource
            + "&ticket=" + oneTimeTicket;
        request({url: url, strictSSL: false}, function (err, response) {
            cb(err, response);
        });
    });
};

