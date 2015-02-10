var path = require('path');

require(path.join(__dirname, '../../../../deploy/configTest.js'));

var express = require('express')
  , https = require('https')
  , util = require('util')
  , crypto = require('crypto')
  , fs = require('fs')
  , config = require('config')  
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , methodOverride = require('method-override')
  , morganLogger = require('morgan')
;

var app = express();

// all environments
app.set('port', config.vsac.port || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(morganLogger('dev'));
app.use(bodyParser);
app.use(methodOverride());
app.use(cookieParser('your secret here'));
app.use(session({ secret: 'omgnodeworks' }));

app.get('/vsac/ws/Ticket', function(req, res) {
    res.send("MOCKticket.");
});

app.post('/vsac/ws/Ticket', function(req, res) {
    res.send("MOCKticket.");
});

app.post('/vsac/ws/Ticket/:ticketId', function(req, res) {
    res.send("MOCKticket.");
});

app.get('/vsac/ws/RetrieveValueSet', function(req, res) {
    var key = req.query['id'];
    if (!fs.existsSync(path.join(__dirname, './vsac-data/' + key))) {
        res.status(404).send("The requested resource () is not available.");
    } else {
        fs.readFile(path.join(__dirname, './vsac-data/' + key), function(err, data) {
            if (err) {
                res.send("file is corrupt");
            } else {
                res.send(data);
            }
        });
    }
});

// Mocks UTS ticket validation process
app.post('/cas/serviceValidate', function(req, res) {
    if( req.query.ticket === 'invalid' ) {
        res.send("<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>\n\
	<cas:authenticationFailure code='INVALID_TICKET'>\n\
		ticket &#039;ST-430048-3Em71CBricwWoL7bd5nc-cas&#039; not recognized\n\
	</cas:authenticationFailure>\n\
</cas:serviceResponse>");
    } else if( req.query.ticket === 'valid' ) {
        res.send("<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>\n\
	<cas:authenticationSuccess>\n\
		<cas:user>ninds</cas:user>\n\
	</cas:authenticationSuccess>\n\
</cas:serviceResponse>");
    } else if( req.query.ticket === 'timeout1' ) {
        // Return after 1 sec, ticket validation times out after 2 sec, ticket validation passes
        setTimeout(function() {
            res.send("<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>\n\
	<cas:authenticationSuccess>\n\
		<cas:user>ninds</cas:user>\n\
	</cas:authenticationSuccess>\n\
</cas:serviceResponse>");
        }, 1000);
    } else if( req.query.ticket === 'timeout4' ) {
        // Return after 4 sec, ticket validation times out after 2 sec, ticket validation doesn't pass
        setTimeout(function() {
            res.send("<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>\n\
	<cas:authenticationSuccess>\n\
		<cas:user>ninds</cas:user>\n\
	</cas:authenticationSuccess>\n\
</cas:serviceResponse>");
        }, 4000);
    }
});

var options = {
  key: fs.readFileSync(path.join(__dirname, './server.key')),
  cert: fs.readFileSync(path.join(__dirname, './server.crt'))
};

https.createServer(options, app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});