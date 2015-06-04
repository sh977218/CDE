var spawn = require('child_process').spawn,
    express = require('express'),
    http = require('http'),
    config = require('../system/node-js/parseConfig'),
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
        } catch (e) {
            console.log("error retrieving status. " + e);
        }
    });
};

var spawned;

var spawnChild = function() {
    var opts = {stdio: 'inherit'};
    var nodeProcess = config.pmNodeProcess || "node";
    spawned = spawn(nodeProcess, ['app'], opts);
    setTimeout(function() {
        getHosts();
    }, 10 * 1000)
};

spawnChild();

config.pmRunOnStartup.forEach(function(toRun) {
    spawn(toRun);
});


var initKibana = function() {
    var kibanaData = require('../../deploy/kibana.js').kibana;

    setTimeout(function(){
        console.log("Cleaning Kibana");
        // start by removing everything from each kibana index
        kibanaData.hits.hits.forEach(function(hit) {
            request.del(config.elastic.uri + "/" + hit._index + "/" + hit._type).on("error", function(err){
                console.log("Unable to empty index");
            });
        });
    }, 5000);

    // now add the visualization etc..
    setTimeout(function() {
        console.log("Initializing Kibana");
        kibanaData.hits.hits.forEach(function (hit) {
            request({
                uri: config.elastic.uri + "/" + hit._index + "/" + hit._type + "/" + hit._id
                , method: "PUT"
                , json: true
                , body: hit._source
            }).on("error", function (err) {
                console.log("Unable to empty index");
            });
        });
    }, 8000);
};

initKibana();

var app = express();

app.set('port', config.pm.port || 3081);
app.use(bodyParser.json());

var verifyToken = function(req, cb) {
    var found = false;
    allHosts.forEach(function(host) {
        if (host.hostname === req.body.requester.host && host.port == req.body.requester.port) {
            found = true;
            var url = "http://" + host.hostname;
            if (host.hostname === 'localhost') url += ":" + host.port;
            url += "/statusToken";
            request({uri: url, method: "GET", strictSSL: false}, function (error, response, body) {
                cb (body === req.body.token);
            });
        }
    });
    if (!found) cb(false);
};

app.post('/stop', function(req, res) {
    verifyToken(req, function(valid) {
        if (valid) {
            spawned.kill();
            return res.send('OK');
        } else {
            return res.status(403).send();
        }
    });
});

app.post('/restart', function(req, res) {
    verifyToken(req, function(valid) {
        if (valid) {
            spawned.kill();
            spawnChild();
            return res.send('OK');
        } else {
            return res.status(403).send();
        }
    });
});

app.post('/deploy', multer(), function(req, res) {
    req.body.requester = {host: req.body.requester_host, port: req.body.requester_port};
    verifyToken(req, function(valid) {
        if (valid) {

            var gzPath = config.pm.tempDir + "deploy.tar.gz";
            if (fs.existsSync(gzPath)) fs.unlinkSync(gzPath);
            var gpg = spawn('gpg', ["-o", gzPath, "-d", req.files.deployFile.path], {stdio: 'inherit'});
            gpg.on('error', function (err) {
                res.status(500).send("Error decrypting file");
            });
            gpg.on('close', function (code) {
                if (code !== 0) {
                    console.log("Error untar-ing");
                    res.status(500).send("Error untar-ing");
                } else {
                    res.send("File received. Deploying...");
                    var writeS = tar.extract(config.pm.extractDir);
                    fs.createReadStream(gzPath).pipe(zlib.createGunzip()).pipe(writeS);
                    writeS.on('finish', function () {
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
