const config = require('../server/system/parseConfig');
const conn = require('../server/system/connections').establishConnection(config.database.log);
const SQ = require("../server/log/dbLogger").StoredQueryModel;
const schemas = require('../server/log/schemas');
const newSQ = conn.model('newSQ', schemas.storedQuerySchema);

const cursor = SQ.find({}).cursor();

(async function run() {
    // console.log(cursor.next());
    for (let sq = await cursor.next(); sq != null; sq = await cursor.next()) {
        sq = sq.toObject();
        delete sq._id;
        await newSQ(sq).save();
    }

    process.exit(0);
})();

