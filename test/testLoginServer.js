const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const favicon = require('serve-favicon');
const {randomUUID} = require("node:crypto");

const database = config.database.appData;
const url = 'mongodb://' + (database.username ? database.username + ':' + database.password + '@' : '')
    + config.database.servers.map((srv) => srv.host + ':' + srv.port).join(',') + '/' + database.db;
let db;

MongoClient.connect(url).then(client => {
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

const tokens = {
    userExistingInUtsButNotCDE: 'suerpower-ticket'
};

/**
 * @description this endpoint mocks CIT PIV card login and returns service ticket
 */
app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password || 'failme';
    db.collection('users').findOne({username, password}).then(user => {
        if (user || username === 'userExistingInUtsButNotCDE') {
            const ticket = 'CDE-' + randomUUID() + '-localhost'
            tokens[ticket] = username;
            res.redirect(302, `${req.query.service}?ticket=${ticket}`);
        } else {
            res.send('Login Failed');
        }
    }, () => {
        res.send('Login Error');
    });
});

/**
 * @description this endpoint mocks UTS login to retrieve UTS username from ticket
 */
app.get('/serviceValidate', (req, res) => {
    const username = tokens[req.query.ticket];
    res.send({
        idpUserOrg: 'testServer',
        utsUser: username ? {username} : undefined,
    })
})

if (![
    'dev-test', // CI
    'my-test', // additional local
    'test' // default local, uses UTS login
    'test-local' // local required for test server
].includes(process.env.NODE_ENV)) {
    console.error(`Test Login Server not started. Current test configuration NODE_ENV=${process.env.NODE_ENV} is not recognized.`);
    process.exit(1);
} else if (!config.test || !config.test.testLoginServer.port) {
    console.error(`Test Login Server not started. Check test configuration. Current NODE_ENV=${process.env.NODE_ENV}`);
    process.exit(1)
} else {
    const port = config.test.testLoginServer.port;
    app.listen(port);
    console.log('TEST Login Server running on port ' + port);
}
