import { Client } from 'elasticsearch';
import { StoredQueryModel } from "server/log/dbLogger";
import { config } from 'server/system/parseConfig';

const esClient = new Client({
    hosts: config.elastic.hosts
});

async function run() {
    let done = 0;
    const cursor = StoredQueryModel.find({}).cursor();
    for (let sq = await cursor.next(); sq != null; sq = await cursor.next()) {

        let body = sq.toObject();
        // let id =  sq._id.toString();
        delete body._id;
        // console.log(sq);

        await esClient.index({
            index: "storedqueries",
            type: "sq",
            id: sq._id.toString(),
            body: body
        });

        console.log(++done);
    }

    process.exit();
}

run();
