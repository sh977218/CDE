var https = require('https')
  , xml2js = require('xml2js')
  , helpers = require('./helpers.js')
//  , logging = require('./logging.js')
  , config = require(process.argv[2]?('../'+process.argv[2]):'../config.js')
;

var ticketValidationOptions = {
    host: config.uts.ticketValidation.host
    , hostname: config.uts.ticketValidation.host
    , port: config.uts.ticketValidation.port
    , path: config.uts.ticketValidation.path
    , method: 'POST'
    , agent: false
    , requestCert: true
    , rejectUnauthorized: false

};

var parser = new xml2js.Parser();

/**
 * Checks the validity of a ticket via a POST API call to validation server.
 * 
 * @param tkt - ticket to valadate
 */
exports.ticketValidate = function( tkt, cb ) {
    ticketValidationOptions.path = config.uts.ticketValidation.path + '?service=' + config.uts.service + '&ticket=' + tkt;
    var req = https.request(ticketValidationOptions, function(res) {
        var output = '';
        res.setEncoding('utf8');
        
        res.on('data', function (chunk) {
            output += chunk;
        });
        
        res.on('end', function() {
            // Parse xml result from ticket validation
            parser.parseString( output, function( err, jsonResult ) {
                if( err ) {
                    return cb( 'ticketValidate: ' + err );
                } else if( jsonResult['cas:serviceResponse'] && 
                           jsonResult['cas:serviceResponse']['cas:authenticationFailure'] ) {
                    // This statement gets the error message
                    //jsonResult['cas:serviceResponse']['cas:authenticationFailure'][0]['_'];
                    return cb( jsonResult['cas:serviceResponse']['cas:authenticationFailure'][0]['$']['code'] );
                } else if( jsonResult['cas:serviceResponse']['cas:authenticationSuccess'] &&
                           jsonResult['cas:serviceResponse']['cas:authenticationSuccess'] ) {
                    // Returns the username
                    return cb( null, jsonResult['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:user'][0] );
                }
                
                return cb( 'ticketValidate: invalid XML response!' );
            });
            
        });
    });
    
    req.on('error', function (e) {
        //logging.expressErrorLogger.info('getTgt: ERROR with request: ' + e);
    });
    
    req.on("timeout", function() { 
        req.abort();
        return cb( 'ticketValidate: Request timeout. Abort if not done!' );
    });
    
    // Emit timeout event if no response within GLOBALS.REQ_TIMEOUT seconds
    setTimeout(function() {
        req.emit("timeout");
    }, helpers.GLOBALS.REQ_TIMEOUT);
    

    req.end();
};