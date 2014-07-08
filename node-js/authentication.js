var https = require('https')
  , xml2js = require('xml2js')
  , config = require(process.argv[2]?('../'+process.argv[2]):'../config.js')
;

// Global variables
var GLOBALS = {
    REQ_TIMEOUT : 2000
};

var ticketValidationOptions = {
    host: config.uts.ticketValidation.host
    , hostname: config.uts.ticketValidation.host
    , port: config.uts.ticketValidation.port
    , path: config.uts.ticketValidation.path
    , method: 'GET'
    , agent: false
    , requestCert: true
    , rejectUnauthorized: false

};

var parser = new xml2js.Parser();

/**
 * Checks the validity of a ticket via a POST API call to validation server.
 * 
 * @param tkt - ticket to valadate
 * @returns 
 */
exports.ticketValidate = function( tkt, cb ) {
    ticketValidationOptions.path = config.uts.ticketValidation.path + 'sasdf?service=' + config.uts.service + '&ticket=' + tkt;
    
    var req = https.request( ticketValidationOptions, function( res ) {
        var output = '';
        res.setEncoding( 'utf8' );

        res.on( 'data', function( chunk ) {
            output += chunk;
        });
        res.on( 'end', function() {
            // Parse xml result from ticket validation
            parser.parseString( output, function( err, jsonResult ) {
                if( err ) {
                    return cb( 'ticketValidate Error: ' + err );
                } else if( jsonResult['cas:serviceResponse']['cas:authenticationFailure'] ) {
                    // This gets the error message
                    //jsonResult['cas:serviceResponse']['cas:authenticationFailure'][0]['_'];
                    return cb( jsonResult['cas:serviceResponse']['cas:authenticationFailure'][0]['$']['code'] );
                } else if( jsonResult['cas:serviceResponse']['cas:authenticationSuccess'] ) {
                    // Returns the username
                    return cb( null, jsonResult['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:user'][0] );
                }
                
                return cb( 'ticketValidate Error: invalid XML response!' );
            });
        });
    });

    // Emit timeout event if no response in GLOBALS.REQ_TIMEOUT seconds
    setTimeout(function() {
        req.emit("timeout");
    }, GLOBALS.REQ_TIMEOUT);

    req.on('error', function (e) {
        console.log('serviceValidate: ERROR with request: ' + e);
    });
    
    req.on("timeout", function() { 
        console.log('serviceValidate: Request timeout!');
        req.abort();
        return cb( 'serviceValidate: Request timeout!' );
    });

    req.end( 'ticketValidate' );
};