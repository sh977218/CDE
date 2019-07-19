import { config } from '../server/system/parseConfig';
import { StoredQueryModel } from '../server/log/dbLogger';
import { storedQuerySchema} from '../server/log/schemas';
import { establishConnection } from '../server/system/connections';

const conn = establishConnection(config.database.log);
const newSQ = conn.model('newSQ', storedQuerySchema);
const cursor = StoredQueryModel.find({}).cursor();

(async function run() {
    // console.log(cursor.next());
    for (let sq = await cursor.next(); sq != null; sq = await cursor.next()) {
        sq = sq.toObject();
        delete sq._id;
        await newSQ(sq).save();
    }

    process.exit(0);
})();
