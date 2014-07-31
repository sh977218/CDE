var config = require('config');

exports.GLOBALS = {
    REQ_TIMEOUT : 2000
    , logdir : config.logdir || __dirname
};
