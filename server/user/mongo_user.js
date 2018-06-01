const MongoClient = require('mongodb').MongoClient;
const config = require('../system/parseConfig');

MongoClient.connect(config.mongoUri, function (err, client) {
    const db = client.db(config.database.appData.db);
    
    // List all the available databases
    adminDb.listDatabases(function (err, dbs) {
        test.equal(null, err);
        test.ok(dbs.databases.length > 0);
        client.close();
    });
});

