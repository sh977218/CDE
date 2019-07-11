import { config } from 'server/system/parseConfig';

const StoredQuery = require("../server/log/dbLogger").StoredQueryModel;
const elasticsearch = require('elasticsearch');

const esClient = new elasticsearch.Client({
    hosts: config.elastic.hosts
});


async function run() {

    let done = 0;
    const cursor = StoredQuery.find({}).cursor();
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