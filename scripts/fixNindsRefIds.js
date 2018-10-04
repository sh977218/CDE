const _ = require('lodash');
const DataElement = require('../server/cde/mongo-cde').DataElement;

let DAOs = [
    {
        name: 'de',
        count: 0,
        dao: DataElement,
        incorrectMap: {}
    }
];

doDAO = DAO => {
    return new Promise(async (resolve, reject) => {
        let cond = {
            "ids.source": "NINDS",
            "archived": false
        };
        DAO.dao.find(cond).cursor({batchSize: 1000, useMongooseAggCursor: true})
            .eachAsync(elt => {
                return new Promise(async (resolveDAO, reject) => {
                    let eltObj = elt.toObject();
                    elt.designations = _.dropWhile(eltObj.designations, d => {
                        return !d.designation || _.isEmpty(d.designation)
                    });
                    elt.designations.forEach(d => {
                        d.tags = _.dropWhile(d.tags, t => t === 'Health');
                    });

                    elt.definitions = _.dropWhile(eltObj.definitions, d => !d.definition || _.isEmpty(d.definition));
                    elt.definitions.forEach(d => {
                        d.tags = _.dropWhile(d.tags, t => t === 'Health');
                    });

                    eltObj.ids.forEach(i => {
                        if (i.source === 'NINDS') {
                            if (i.version === '1') i.version = '1.0';
                            if (i.version === '2') i.version = '3.0';
                            if (i.version === '3') i.version = '3.0';
                            if (i.version === '4') i.version = '4.0';
                            if (i.version === '5') i.version = '5.0';
                            if (i.version === '6') i.version = '6.0';
                        }
                    });
                    elt.ids = eltObj.ids;

                    eltObj.referenceDocuments.forEach((r, i) => {
                        let ref = {};
                        if (r.title) {
                            ref.document = r.title;
                            eltObj.referenceDocuments[i] = ref;
                        }
                    });
                    elt.referenceDocuments = eltObj.referenceDocuments;
                    await elt.save();
                    DAO.count++;
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

setInterval(() => {
    for (let DAO of DAOs) console.log(DAO.name + ' ' + DAO.count);
}, 5000);

