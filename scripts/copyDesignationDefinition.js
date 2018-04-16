const _ = require('lodash');
const DataElement = require('../server/cde/mongo-cde').DataElement;
const Form = require('../server/form/mongo-form').Form;
const mongo_data = require('../server/system/mongo-data');

function run() {
    let DAOs = [
        {
            name: 'de',
            count: 0,
            dao: DataElement
        },
        {
            name: 'form',
            count: 0,
            dao: Form
        }
    ];

    DAOs.forEach(DAO => {
        let cursor = DAO.dao.find({}).cursor();

        cursor.on('close', function () {
            console.log("Finished all. count: " + count);
        });
        cursor.on('error', function (err) {
            console.log("error: " + err);
            process.exit(1);
        });

        cursor.eachAsync(elt => {
            return new Promise((resolve, reject) => {
                let definitions = mongo_data.copyDefinition(elt.naming);
                let designations = mongo_data.copyDesignation(elt.naming);
                elt.definitions = definitions;
                elt.designations = designations;
                elt.markModified('definitions');
                elt.markModified('designations');
                elt.save(err => {
                    if (err)
                        reject(err);
                    else {
                        DAO.count++;
                        console.log(DAO.name + "Count: " + DAO.count);
                        resolve();
                    }
                });
            });
        }).then(err => {
            if (err) throw err;
            console.log("Finished all.");
            process.exit(1);
        });
    })
}

run();