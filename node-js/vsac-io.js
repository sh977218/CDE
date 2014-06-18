var https = require('https')
    , querystring = require('querystring')
    , config = require(process.argv[2]?('../'+process.argv[2]):'../config.js')
    , fs = require('fs')
    , util = require('util')
    , request = require('request')
;

var authData = querystring.stringify( {
    username: config.vsac.username
    , password: config.vsac.password
});

var ticketData = querystring.stringify({
    service: 'http://umlsks.nlm.nih.gov'
});

var vsacHost = config.vsac.host;
var vsacPort = config.vsac.port;

var tgtOptions = {
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


var ticketOptions = {
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

var valueSetOptions = {
    host: vsacHost,
    port: vsacPort,
    path: config.vsac.valueSet.path,
    method: 'GET',
    agent: false,
    requestCert: true,
    rejectUnauthorized: false
};

var vsacTGT = '';

exports.umlsAuth = function(user, password, cb) {
    request.post(
        'https://uts-ws.nlm.nih.gov/restful/isValidUMLSUser',
        { form: {
        licenseCode:  config.umls.licenseCode
        , user: user
        , password: password
        }}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(body);
        }
    }
);
};

exports.getTGT = function (cb) {
    var req = https.request(tgtOptions, function(res) {
        var output = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function() {
            vsacTGT = output;
            ticketOptions.path = config.vsac.ticket.path + '/' + vsacTGT;
            cb(vsacTGT);
        });
    });
    
    req.on('error', function (e) {
        console.log('getTgt: ERROR with request ' + e);
    });
    
    req.write(authData);
    req.end();
};

exports.getTicket = function(cb) {
    var req = https.request(ticketOptions, function(res) {
        var output = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function() {
            var ticket = output;
            cb(ticket);
        });
    });
    
    req.on('error', function (e) {
        console.log('getTicket: ERROR with request ' + e);
    });
    
    req.write(ticketData);
    req.end();
};

exports.getValueSet = function(vs_id, cb) {
    this.getTicket(function(vsacTicket) {
        valueSetOptions.path = config.vsac.valueSet.path + '?id=' + vs_id + "&ticket=" + vsacTicket;
        var req = https.request(valueSetOptions, function(res) {
            var output = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                output += chunk;
            });
            res.on('end', function() {
                if (res.statusCode === 404) {
                    cb(404);
                }
                if (output.length > 0) {
                    cb(output);
                }
            });
        });

        req.on('error', function (e) {
            console.log('getValueSet: ERROR with request ' + e);
            cb(400);
        });

        req.end();
    });
};
