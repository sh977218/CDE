const MongoClient = require('mongodb').MongoClient;
const config = require('../system/parseConfig');

MongoClient.connect(config.url, function(err, client) {
    const adminDb = client.db(config.db).admin();
    // List all the available databases
    adminDb.listDatabases(function(err, dbs) {
        test.equal(null, err);
        test.ok(dbs.databases.length > 0);
        client.close();
    });
});

