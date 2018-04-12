const _ = require('lodash');
const DataElement = require('../server/cde/mongo-cde').DataElement;
const Form = require('../server/form/mongo-form').Form;
const mongo_data = require('../server/system/mongo-data');

let count = 0;

function run() {
    let DAOs = [DataElement, Form];
//    let DAOs = [DataElement];
    DAOs.forEach(dao => {
        let cursor = dao.find({}).cursor();
        cursor.eachAsync(elt => {
            return new Promise((resolve, reject) => {
                let definitions = mongo_data.copyDefinition(elt.naming);
                elt.definitions = definitions;
                elt.save(err => {
                    if (err) reject(err);
                    count++;
                    console.log("count: " + count);
                    resolve();
                });
            });
        }).then(err => {
            if (err) throw err;
            console.log("Finished all. count: " + count);
            process.exit(1);
        });
    })
}

run();