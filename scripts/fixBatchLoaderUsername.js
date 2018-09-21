const DataElement = require('../server/cde/mongo-cde').DataElement;
const Form = require('../server/form/mongo-form').Form;

let batchloader = 'batchloader';
let badUsername = ['BatchLoader', 'batchLoader', 'batch'];
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
    return new Promise(async (resolve, reject) => {
        let cond = {
            $or: [
                {'createdBy.username': {$in: badUsername}},
                {'updatedBy.username': {$in: badUsername}}
            ]
        };
        DAO.dao.find(cond).cursor({batchSize: 1000, useMongooseAggCursor: true})
            .eachAsync(elt => {
                return new Promise(async (resolveDAO, reject) => {
                    if (badUsername.indexOf(elt.updatedBy.username) > -1) {
                        elt.updatedBy.username = batchloader;
                    }
                    if (badUsername.indexOf(elt.createdBy.username) > -1) {
                        elt.createdBy.username = batchloader;
                    }
                    await elt.save();
                    console.log(DAO.name + ' ' + ++DAO.count);
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