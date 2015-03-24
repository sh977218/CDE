var spawn = require('child_process').spawn,
    express = require('express'),
    http = require('http'),
    config = require('config'),
    request = require('request'),
    bodyParser = require('body-parser')
    ;

var allHosts = [];
var getHosts = function() {
    request("http://localhost:" + config.port + "/serverStatuses", function(err, res, body) {
        if (err) console.log("Error getting server status: " + err);
        try {
            allHosts = JSON.parse(body).map(function (server) {
                return {hostname: server.hostname, port: server.port};
            });
            getTokens();
        } catch (e) {
            console.log("error retrieving status. " + e);
        }
    });
};

var getTokens = function() {
    allHosts.forEach(function(server){
        request("http://" + server.hostname + ":" + server.port + "/statusToken", function(error, response, body) {
            server.token = body;
        });
    });
};

var spawned;

var spawnChild = function() {
    console.log("Spawning process.");
    spawned = spawn('node', ['app'], {stdio: 'inherit'});
    setTimeout(function() {
        getHosts();
    }, 10 * 1000)
};

spawnChild();

var app = express();

app.set('port', config.pm.port || 3081);
app.use(bodyParser.json());

app.post('/stop', function(req, res) {
    console.log("body: " + req.body);
    allHosts.forEach(function(host) {
        if (host.hostname === req.body.requester.host
            && host.port == req.body.requester.port
            && host.token === req.body.token) {
            spawned.kill();
            return res.send('OK');
        }
    });
    return res.status(403).send();
});

app.get('/start', function(req, res) {
    spawnChild();
    res.send('OK');
});

app.get('/status', function(req, res) {
    res.send({killed: spawned.killed});
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

setInterval(function() {
    getHosts();
}, (config.pm.serverStatusInterval || 6 * 60) * 60 * 1000);

// get Token at regular interval
setInterval(function() {
    getTokens();
}, (config.pm.tokenInterval || 5) * 60 * 1000);