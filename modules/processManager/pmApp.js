var spawn = require('child_process').spawn,
    express = require('express'),
    http = require('http'),
    config = require('config')

var spawned;

var spawnChild = function() {
    console.log("spawing");
    spawned = spawn('node', ['app'], {stdio: 'inherit'});
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