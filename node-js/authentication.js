var https = require('https')
    , querystring = require('querystring')
    , config = require(process.argv[2]?('../'+process.argv[2]):'../config.js')
    , fs = require('fs')
    , util = require('util')
    , request = require('request')
;

var ticketValidationOptions = {
    hostname: config.ticketValidation.host,
    port: config.ticketValidation.port,
    path: config.ticketValidation.path,
    method: 'GET'
};

/**
 * Checks the validity of a ticket via a POST API call to validation server.
 * 
 * @param {type} cb
 * @returns {undefined}
 */
exports.serviceValidate = function(cb) {
    var req = https.request(ticketValidationOptions, function(res) {
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
            console.log('getValueSet: ERROR with request: ' + e);
            cb(400);
        });

        req.end();
    });
};
