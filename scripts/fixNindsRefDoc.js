const _ = require('lodash');

const DataElement = require('../server/cde/mongo-cde').DataElement;
const Form = require('../server/form/mongo-form').Form;

let DAOs = [
    {
        name: 'de',
        count: 0,
        dao: DataElement,
        incorrectMap: {}
    },
    {
        name: 'form',
        count: 0,
        dao: Form,
        incorrectMap: {}
    }
];

doDAO = DAO => {
    let cond = {archived: false, 'referenceDocuments.0': {$exists: true}, 'ids.source': 'NINDS'};
    return new Promise(async (resolve, reject) => {
        DAO.dao.find(cond).cursor({batchSize: 1000, useMongooseAggCursor: true})
            .eachAsync(elt => {
                let list = elt.toObject().referenceDocuments;
                return new Promise(async (resolveDAO, reject) => {
                    if (list.length > 0) {
                        list.forEach(r => r.source = 'NINDS');
                        elt.referenceDocuments = list;
                        await elt.save();
                        console.log(DAO.name + ': ' + ++DAO.count);
                    }
                    resolveDAO();
                });
            }).then(() => resolve());
    })
};

function run() {
    return new Promise(async (resolve, reject) => {
        for (let DAO of DAOs) {
            await doDAO(DAO);
            console.log("Finished " + DAO.name + " Count: " + DAO.count);
        }
        resolve();
    })
}

run().then(() => process.exit(1));