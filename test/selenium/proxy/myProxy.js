var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer();

process.on('uncaughtException', function (err) {
    console.log('caught exception: ');
});

http.createServer(function (req, res) {
    // This simulates an operation that takes 500ms to execute
    setTimeout(function () {
        try {
            proxy.web(req, res, {
                target: 'http://cde-dev.nlm.nih.gov'
            });
        } catch (e) {}
    }, Math.random() * 800);
}).listen(5001);
