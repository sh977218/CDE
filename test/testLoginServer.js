const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const database = config.database.appData;
const url = 'mongodb://' + database.username + ':' + database.password + '@'
    + config.database.servers.map((srv) => srv.host + ':' + srv.port).join(',')
    + '/' + database.db;
let db;

MongoClient.connect(url, (err, client) => {
    if (err) {
        throw err;
    }
    db = client.db(database.db);
    if (!db) {
        throw new Error('login server initialization failed');
    }
});

const app = express();
app.use(bodyParser.urlencoded({extended: false, limit: '5mb'}));
app.use(bodyParser.json({limit: '16mb'}));

app.get('/', function (req, res) {
    res.send(`
        <html>
            <head>
                <title>CDE Test Login</title>
            </head>
            <body>
                <form method="post" action="/login?service=${req.query.service}">
                    <label>
                        Username:
                        <input name="username"/>
                    </label>
                    <label>
                        Password:
                        <input type="password" name="password"/>
                    </label>
                    <input type="submit"/>
                </form>
            </body>
        </html>
    `);
});

const tokens = {};

app.post('/login', (req, res) => {
    db.collection('users').countDocuments({username: req.body.username, password: req.body.password || 'failme'}).then(count => {
        if (count) {
            const token = 'CDE-' + Math.random().toString(36).substr(2) + '-localhost'
            tokens[token] = req.body.username;
            res.redirect(302, req.query.service + '?ticket=' + token);
        } else {
            res.send('Login Failed');
        }
    }, err => {
        res.send('Login Error');
    });
});

app.get('/serviceValidate', (req, res) => {
    const username = tokens[req.query.ticket];
    res.send({
        utsUser: username ? {username} : undefined
    });
});

if (['dev-test', 'test'].includes(process.env.NODE_ENV) && config.test && config.test.testLoginServer.port) {
    const port = config.test.testLoginServer.port;
    app.listen(port);
    console.log('TEST Login Server running on port ' + port);
} else {
    console.error('Test Login Server not started. Check test configuration.');
}