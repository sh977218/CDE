var spawn = require('child_process').spawn,
    express = require('express'),
    http = require('http'),
    config = require('config'),
    request = require('request')


var allHosts = [];
var getHosts = function() {
    request("http://localhost:" + config.port + "/serverStatuses", function(err, res, body) {
        if (err) console.log("Error getting server status: " + err);
        try {
            allHosts = JSON.parse(body).map(function (server) {
                return server.hostname;
            });
            console.log("all hosts: " + allHosts);
        } catch (e) {
            console.log("error retrieving status. " + e);
        }
    });
}

var tokens = {};
var getTokens = function() {
    allHosts.forEach(function(hostname){
        request("http://" + hostname)
    });
}

var spawned;

var spawnChild = function() {
    console.log("Spawning process.");
    spawned = spawn('node', ['app'], {stdio: 'inherit'});
    setTimeout(function() {
        getHosts();
    }, 5 * 1000)
}

spawnChild();

var app = express();

app.set('port', config.pm.port || 3081);

app.get('/stop', function(req, res) {
    spawned.kill();
    res.send('OK');
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
setInterval(function() {}, (congif.pm.tokenInterval || 5) * 60 * 1000)