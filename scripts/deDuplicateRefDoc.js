const _ = require('lodash');

const DataElement = require('../server/cde/mongo-cde').DataElement;
const Form = require('../server/form/mongo-form').Form;

let count = 0;

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
    let cond = {'referenceDocuments.0': {$exists: true}};
    return new Promise(async (resolve, reject) => {
        DAO.dao.find(cond)
            .cursor({batchSize: 1000, useMongooseAggCursor: true})
            .eachAsync(elt => {
                let list = elt.toObject().referenceDocuments;
                return new Promise(async (resolveDAO, reject) => {
                    if (list.length > 0) {
                        let uniqueList = _.uniqWith(list, (a, b) => {
                            let aCopy = _.cloneDeep(a);
                            let bCopy = _.cloneDeep(b);
                            [aCopy, bCopy].forEach(obj => {
                                for (let p in obj) {
                                    if (_.isEmpty(obj[p])) delete obj[p];
                                    else obj[p] = _.words(obj[p], /[^\s]+/g).join(" ");
                                }
                            });
                            let result = _.isEqual(aCopy, bCopy);
                            return result;
                        });
                        elt.referenceDocuments = uniqueList;
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