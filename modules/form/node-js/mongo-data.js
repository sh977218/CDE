var mongoose = require('mongoose')
    , config = require('config')
    , schemas = require('./schemas')
    ;
    
var mongoUri = config.mongoUri;

var conn = mongoose.createConnection(mongoUri);

conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function callback () {
    console.log('mongodb connection open');
});    

var Form = conn.model('Form', schemas.formSchema);

console.log(1);

Form.find().count().exec(function (err, count) {
    console.log(count);
});