import { Dictionary } from 'async';
import * as Config from 'config';
import { Router } from 'express';
import { Db, MongoClient } from 'mongodb';

const config = Config as any;
const database = config.database.appData;
const url = 'mongodb://' + database.username + ':' + database.password + '@'
    + config.database.servers.map((srv: any) => srv.host + ':' + srv.port).join(',')
    + '/' + database.db
let db: Db;

MongoClient.connect(url, (err, client) => {
    if (err) {
        throw err;
    }
    db = client.db(database.db);
    if (!db) {
        throw new Error('login server initialization failed');
    }
});

export function module() {
    const router = Router();

    router.get('/', (req, res) => {
        res.send(`
        <html>
            <head>
                <title>CDE Test Login</title>
            </head>
            <body>
                <form method="post" action="./testLogin/login?service=${req.query.service}">
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

    const tokens: Dictionary<string> = {};

    router.post('/login', (req, res) => {
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

    router.get('/serviceValidate', (req, res) => {
        const username = tokens[req.query.ticket];
        res.send({
            utsUser: username ? {username} : undefined
        });
    });

    return router;
}
