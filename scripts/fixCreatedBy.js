const DataElement = require('../server/cde/mongo-cde').DataElement;
const Form = require('../server/form/mongo-form').Form;

let batchloader = 'batchloader';
let badUsername = ['BatchLoader', 'batchloader', 'batchLoader', 'batch'];
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

function run() {
    return new Promise(async (resolve, reject) => {
        for (let DAO of DAOs) {
            let cond = {'updatedBy.username': {$in: badUsername}};
            DAO.dao.find(cond)
                .cursor({batchSize: 1000, useMongooseAggCursor: true})
                .eachAsync(elt => {
                    return new Promise(async (resolve, reject) => {
                        elt.updatedBy.username = batchloader;
                        await elt.save();
                        DAO.count++;
                        resolve();
                    });
                }).then(() => {
                console.log("Finished " + DAO.name + " Count: " + DAO.count);
            });

        }
    })
}

run();