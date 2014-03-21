var express = require('express')
  , https = require('https')
  , util = require('util')
  , crypto = require('crypto')
  , fs = require('fs')
;

var app = express();

// all environments
app.set('port', process.env.VSAC_PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({ secret: 'omgnodeworks' }));


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
    console.log("hello")
    var key = req.query['id'];
    if (!fs.existsSync('node-js/mock/vsac-data/' + key)) {
        res.status(404).send("The requested resource () is not available.");
    } else {
        fs.readFile('node-js/mock/vsac-data/' + key, function(err, data) {
            if (err) {
                res.send("file is corrupt");
            } else {
                res.send(data);
            }
        });
    }
});

var options = {
  key: fs.readFileSync('node-js/mock/server.key'),
  cert: fs.readFileSync('node-js/mock/server.crt')
};


https.createServer(options, app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
