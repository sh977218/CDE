var spawn = require('child_process').spawn,
    express = require('express'),
    http = require('http'),
    config = require('config'),
    request = require('request'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    multer = require('multer'),
    tar = require('tar-fs'),
    zlib = require('zlib')
    ;

var allHosts = [];
var getHosts = function() {
    request("http://localhost:" + config.port + "/serverStatuses", function(err, res, body) {
        if (err) return console.log("Error getting server status: " + err);
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
        var url = "http://" + server.hostname;
        if (server.hostname === 'localhost') url += ":" + server.port;
        url += "/statusToken"
        request(url, function(error, response, body) {
            server.token = body;
        });
    });
};

var spawned;

var spawnChild = function() {
    var opts = {stdio: 'inherit'};
    var nodeProcess = config.pm.nodeProcess || "node";
    spawned = spawn(nodeProcess, ['app'], opts);
    setTimeout(function() {
        getHosts();
    }, 10 * 1000)
};

spawnChild();

var app = express();

app.set('port', config.pm.port || 3081);
app.use(bodyParser.json());

var verifyToken = function(req) {
    var result = false;
    allHosts.forEach(function(host) {
        if (host.hostname === req.body.requester.host
            && host.port == req.body.requester.port
            && host.token === req.body.token) {
            result = true;
        }
    });
    return result;
}

app.post('/stop', function(req, res) {
    if (verifyToken(req)) {
        spawned.kill();
        return res.send('OK');
    } else {
        return res.status(403).send();
    }
});

app.post('/restart', function(req, res) {
    if (verifyToken(req)) {
        spawned.kill();
        spawnChild();
        return res.send('OK');
    } else {
        return res.status(403).send();
    }
});

app.post('/deploy', multer(), function(req, res) {
    req.body.requester = {host: req.body.requester_host, port: req.body.requester_port};
    if (verifyToken(req)) {
        var gzPath = config.pm.tempDir + "deploy.tar.gz";
        if (fs.existsSync(gzPath)) fs.unlinkSync(gzPath);
        var gpg = spawn('gpg', ["-o", gzPath, "-d", req.files.deployFile.path], {stdio: 'inherit'});
        gpg.on('error', function(err) {
            res.status(500).send("Error decrypting file");
        });
        gpg.on('close', function(code) {
            if (code !== 0) {
                console.log("Error untar-ing");
                res.status(500).send("Error untar-ing");
             } else {
                res.send("File received. Deploying...");
                var writeS = tar.extract(config.pm.extractDir);
                fs.createReadStream(gzPath).pipe(zlib.createGunzip()).pipe(writeS);
                writeS.on('finish', function() {
                    fs.chmodSync(config.node.buildDir, '700');
                    spawned.kill();
                    spawnChild();
                });
            }
        })
    } else {
        return res.status(403).send();
    }
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function (err) {
    console.log("uncaught exception");
    console.log(err);
});

setInterval(function() {
    getHosts();
}, (config.pm.serverStatusInterval || 6 * 60) * 60 * 1000);

// get Token at regular interval
setInterval(function() {
    try {
    getTokens();
    } catch (e) {
        console.log("error retrieving status. " + e);
    }
}, (config.pm.tokenInterval || 5) * 60 * 1000);