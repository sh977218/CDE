var util = require('util')
    , mongoose = require('mongoose')
    , uuid = require('node-uuid')
;

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/nlmcde';
console.log("connecting to " + mongoUri);
mongoose.connect(mongoUri);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('mongodb connection open');
    });

var schemas = require('../node-js/schemas');
var User = mongoose.model('User', schemas.userSchema);

var users = [
    {username: 'bob', password: 'secret'}
  , {username: 'cabig', password: 'cabig', regAuthAdmin: []}
  , {username: 'fitbir', password: 'fitbir', regAuthAdmin: []}
  , {username: 'ludet', password: 'ludet', regAuthAdmin: []}
  , {username: 'ctep', password: 'ctep', regAuthAdmin: []}
  , {username: 'nlm', password: 'nlm', siteAdmin: true}
];

for (var i in users) {
    var newUser = new User(users[i]);
    newUser.save(function(err, newUser) {
       if (err) {
           console.log("Unable to save User: " + user[i]);
       } 
    });
};

// wait 5 secs for mongoose to do it's thing before closing
setTimeout((function() {
    console.log("Done");
    process.exit();
}), 5000);

