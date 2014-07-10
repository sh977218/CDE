var config = require(process.argv[2]?('../'+process.argv[2]):'../config.js')
;

exports.GLOBALS = {
    REQ_TIMEOUT : 2000
    , logdir : config.logdir || __dirname
};