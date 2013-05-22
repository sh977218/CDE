var https = require('https')
    , querystring = require('querystring')
    , config = require('../config')
    
var authData = querystring.stringify( {
     username: config.vsac.username
    ,password: config.vsac.password
});

var ticketData = querystring.stringify({
    service: 'http://umlsks.nlm.nih.gov'
});

        
var tgtOptions = {
    host: config.vsac.host,
    port: config.vsac.port,
    path: config.vsac.ticket.path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': authData.length
    }
};

var ticketOptions = {
    host: config.vsac.host,
    port: config.vsac.port,
    path: config.vsac.ticket.path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': ticketData.length
    }
};

var valueSetOptions = {
    host: config.vsac.host,
    port: config.vsac.port,
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
            console.log("got TGT: " + vsacTGT);
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
