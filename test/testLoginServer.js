const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const favicon = require('serve-favicon');

const database = config.database.appData;
const url = 'mongodb://' + (database.username ? database.username + ':' + database.password + '@' : '')
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
                <form method="post" action="/login?service=${req.query.service}" autocomplete="off">
                    <label>
                        Username:
                        <input name="username" autocomplete="off"/>
                    </label>
                    <label>
                        Password:
                        <input type="password" name="password" autocomplete="off"/>
                    </label>
                    <input type="submit" id="loginSubmitBtn"/>
                </form>
            </body>
        </html>
    `);
});

app.use(favicon(path.resolve(__dirname, '../modules/_app/assets/favicon.ico')));

const tokens = {};

app.post('/login', (req, res) => {
    db.collection('users').countDocuments({
        username: req.body.username,
        password: req.body.password || 'failme'
    }).then(count => {
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
        idpUserOrg: 'testServer',
        utsUser: username ? {username} : undefined,
    });
});

if ([
    'dev-test', // CI
    'my-test', // additional local
    'test' // default local
].includes(process.env.NODE_ENV) && config.test && config.test.testLoginServer.port) {
    const port = config.test.testLoginServer.port;
    app.listen(port);
    console.log('TEST Login Server running on port ' + port);
} else {
    console.error(`Test Login Server not started. Check test configuration. Current process.env.NODE_ENV: ${process.env.NODE_ENV}`);
}
