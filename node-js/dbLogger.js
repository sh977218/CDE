var mongoose = require('mongoose')
    , envconfig = require('../envconfig')
    ;
    
    
var mongoLogUri = process.env.MONGO_LOG_URI || envconfig.mongo_log_uri || 'mongodb://localhost/cde-logs';
    
var logConn = mongoose.createConnection(mongoLogUri);
logConn.on('error', console.error.bind(console, 'connection error:'));
logConn.once('open', function callback () {
	console.log('logger connection open');
    });    
    
var LogModel = logConn.model('DbLogger', mongoose.Schema({any: {}}, { strict: false }));

exports.log = function(message, callback) {
    console.log("LOGGING---" + message);
    var logEvent = new LogModel(message);
    logEvent.save(function(err) {
        if (err) console.log ("ERROR: " + err);
        callback(err); 
    });
};

    

