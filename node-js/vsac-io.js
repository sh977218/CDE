var https = require('https')
    , querystring = require('querystring')
    , config = require('../config')
    , fs = require('fs')
    , util = require('util')
;

var envconfig = {};

if (fs.existsSync('./envconfig.js')) {
    envconfig = require('../envconfig');
} else {
    if (!process.env.VSAC_USERNAME || !process.env.VSAC_PASSWORD) {
        console.log("No envconfig file exists. Expecting ENV Variables: VSAC_USERNAME and VSAC_PASSWORD ");
        exit(1);
    }
}

var authData = querystring.stringify( {
    username: process.env.VSAC_USERNAME || envconfig.vsac.username
    , password: process.env.VSAC_PASSWORD || envconfig.vsac.password
});

var ticketData = querystring.stringify({
    service: 'http://umlsks.nlm.nih.gov'
});


var vsacHost = process.env.VSAC_HOST || envconfig.vsac.host || config.vsac.host;
var vsacPort = process.env.VSAC_PORT || envconfig.vsac.port || config.vsac.port

var tgtOptions = {
    host: vsacHost,
    hostname: vsacHost,
    port: vsacPort,
    path: config.vsac.ticket.path,
    method: 'POST',
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
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': ticketData.length
    }
};

var valueSetOptions = {
    host: vsacHost,
    port: vsacPort,
    path: config.vsac.valueSet.path,
    method: 'GET'
};

var vsacTGT = '';

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
        console.log('ERROR with request ' + e);
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
        console.log('ERROR with request ' + e);
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
                if (res.statusCode == 404) {
                    cb(404);
                }
                if (output.length > 0) {
                    cb(output);
                }
            });
        });

        req.on('error', function (e) {
            console.log('ERROR with request ' + e);
        });

        req.end();
    });
};
