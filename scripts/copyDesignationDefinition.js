const _ = require('lodash');
const DataElement = require('../server/cde/mongo-cde').DataElement;
const DataElementDraft = require('../server/cde/mongo-cde').DataElementDraft;
const Form = require('../server/form/mongo-form').Form;
const FormDraft = require('../server/form/mongo-form').FormDraft;
const mongo_data = require('../server/system/mongo-data');

function run() {
    let DAOs = [

        {
            name: 'de draft',
            count: 0,
            dao: DataElementDraft
        }, {
            name: 'form draft',
            count: 0,
            dao: FormDraft
        }
    ];

    DAOs.forEach(DAO => {
        let cursor = DAO.dao.find({}).cursor();

        cursor.eachAsync(elt => {
            return new Promise((resolve, reject) => {
                let definitions = mongo_data.copyDefinition(elt.naming);
                let designations = mongo_data.copyDesignation(elt.naming);
                elt.definitions = definitions;
                elt.designations = designations;
                elt.markModified('definitions');
                elt.markModified('designations');
                elt.save(err => {
                    if (err) {
                        console.log(err);
                        console.log(elt.tinyId);
                        reject(err);
                    } else {
                        DAO.count++;
                        console.log(DAO.name + "Count: " + DAO.count);
                        resolve();
                    }
                });
            });
        }).then(err => {
            if (err) throw err;
            console.log("Finished " + DAO.name + " Count: " + DAO.count);
        });
    })
}

run();