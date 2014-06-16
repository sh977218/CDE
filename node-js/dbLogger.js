var mongoose = require('mongoose')
    , envconfig = require('../envconfig')
    ;
    
    
var mongoLogUri = process.env.MONGO_LOG_URI || envconfig.mongo_log_uri || 'mongodb://localhost/cde-logs';
    
var logConn = mongoose.createConnection(mongoLogUri);
logConn.on('error', console.error.bind(console, 'connection error:'));
logConn.once('open', function callback () {
	console.log('logger connection open');
    });    
    
    
// w = 0 means write very fast. It's ok if it fails.   
// capped means no more than 5 gb for that collection.
var logSchema = new mongoose.Schema(
{
    level: String
    , msg: {
        remoteAddr: String
        , url: String
        , method: String
        , httpStatus: Number
        , date: Date
        , referrer: String
    }    
}, { safe: {w: 0}, capped: 5368709120});
logSchema.index({remoteAddr: 1});
logSchema.index({url: 1});
logSchema.index({httpStatus: 1});
logSchema.index({date: 1});
logSchema.index({referrer: 1});

// w = 0 means write very fast. It's ok if it fails.     
var LogModel = logConn.model('DbLogger', logSchema);

exports.log = function(message, callback) {
    var logEvent = new LogModel(message);
    logEvent.save(function(err) {
        if (err) console.log ("ERROR: " + err);
        callback(err); 
    });
};

    

