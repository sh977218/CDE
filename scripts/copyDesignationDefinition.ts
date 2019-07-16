import { DataElement, DataElementDraft } from 'server/cde/mongo-cde';
import { Form, FormDraft } from 'server/form/mongo-form';
// import { copyDefinition, copyDesignation } from '../server/system/mongo-data';

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
            // let definitions = copyDefinition(elt.naming);
            // let designations = copyDesignation(elt.naming);
            // elt.definitions = definitions;
            // elt.designations = designations;
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
});
