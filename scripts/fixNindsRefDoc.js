const _ = require('lodash');

const DataElement = require('../server/cde/mongo-cde').DataElement;
const Form = require('../server/form/mongo-form').Form;

let DAOs = [
    {
        name: 'de',
        count: 0,
        dao: DataElement,
        incorrectMap: {}
    }
];

doDAO = DAO => {
    let cond = {archived: false, 'referenceDocuments.0': {$exists: true}, 'ids.source': 'NINDS'};
    return new Promise(async (resolve, reject) => {
        DAO.dao.find(cond).cursor({batchSize: 1000, useMongooseAggCursor: true})
            .eachAsync(elt => {
                let list = elt.toObject().referenceDocuments;
                let list1 = elt.toObject().properties;
                return new Promise(async (resolveDAO, reject) => {
                    if (list.length > 0) {
                        list.forEach(r => r.source = 'NINDS');
                        elt.referenceDocuments = list;
                    }
                    if(list1.length > 0 ){
                        let filterList = list1.filter(r => r.key !== 'NINDS Guidelines');
                        elt.properties = filterList;
                    }
                    await elt.save();
                    console.log(DAO.name + ': ' + ++DAO.count);
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