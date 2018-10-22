const DataElement = require('../server/cde/mongo-cde').DataElement;
const DataElementDraft = require('../server/cde/mongo-cde').DataElementDraft;
const Form = require('../server/form/mongo-form').Form;
const FormDraft = require('../server/form/mongo-form').FormDraft;

let DAOs = [
    {
        name: 'de',
        count: 0,
        dao: DataElement,
        finished: false
    },
    {
        name: 'de draft',
        count: 0,
        dao: DataElementDraft,
        finished: false
    },
    {
        name: 'form',
        count: 0,
        dao: Form,
        finished: false
    },
    {
        name: 'form draft',
        count: 0,
        dao: FormDraft,
        finished: false
    }
];

async function doDAO(DAO) {
    DAO.dao.find({archived: false, 'sources.0': {$exists: true}})
        .cursor({batchSize: 1000})
        .eachAsync(async doc => {
            let sources = doc.toObject().sources;
            sources.forEach(source => {
                source.source = source.sourceName;
            });
            doc.sources = sources;
            doc.markModified('sources');
            await doc.save();
            DAO.count++;
        })
}

async function run() {
    for (let DAO of DAOs) {
        await doDAO(DAO);
        console.log("Finished " + DAO.name + " Count: " + DAO.count);
    }
}

run().then(() => {
    for (let DAO of DAOs) {
        console.log(DAO.name + " Count: " + DAO.count);
    }
    process.exit(1);
}, error => console.log(error));

setInterval(() => {
    for (let DAO of DAOs) {
        if (!DAO.finished) console.log(DAO.name + " Count: " + DAO.count);
    }
    console.log('---------------------------------');

}, 5000);
