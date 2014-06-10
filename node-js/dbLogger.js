var mongoose = require('mongoose')
    , envconfig = require('../envconfig')
    ;
    
    
var mongoLogUri = process.env.MONGO_LOG_URI || envconfig.mongo_log_uri || 'mongodb://localhost/cde-logs';
    
mongoose.connect(mongoLogUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('logger connection open');
    });    
    
var LogModel = mongoose.model('DbLogger', mongoose.Schema({any: {}}, { strict: false }));

exports.log = function(message, callback) {
    console.log("LOGGING---");
    var logEvent = new LogModel(message);
    logEvent.save(function(err) {
        callback(err);
    });
};

    

