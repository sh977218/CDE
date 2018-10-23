const DataElement = require('../server/cde/mongo-cde').DataElement;
const DataElementDraft = require('../server/cde/mongo-cde').DataElementDraft;
const Form = require('../server/form/mongo-form').Form;
const FormDraft = require('../server/form/mongo-form').FormDraft;

let DAOs = [
    {
        name: 'de',
        count: 0,
        dao: DataElement
    },
    {
        name: 'de draft',
        count: 0,
        dao: DataElementDraft
    },
    {
        name: 'form',
        count: 0,
        dao: Form
    },
    {
        name: 'form draft',
        count: 0,
        dao: FormDraft
    }
];

async function doDAO(DAO) {
    let cond = {archived: false, 'sources.0': {$exists: true}};
    DAO.total = await DAO.dao.count(cond);
    DAO.dao.find(cond).cursor({batchSize: 1000}).eachAsync(async doc => {
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
        DAO.finished = true;
    }
}

run().then(() => {
    for (let DAO of DAOs) {
        console.log(DAO.name + " Count: " + DAO.count);
    }
}, error => console.log(error));

setInterval(() => {
    for (let DAO of DAOs) {
        console.log('total: ' + total + ' ' + DAO.name + " Count: " + DAO.count);
    }
    console.log('---------------------------------');

}, 5000);
