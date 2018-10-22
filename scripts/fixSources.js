const _ = require('lodash');
const DataElement = require('../server/cde/mongo-cde').DataElement;
const DataElementDraft = require('../server/cde/mongo-cde').DataElementDraft;
const Form = require('../server/form/mongo-form').Form;
const FormDraft = require('../server/form/mongo-form').FormDraft;

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
    },
    {
        name: 'form draft',
        count: 0,
        dao: FormDraft
    }
];

DAOs.forEach(DAO => {
    DAO.dao.find({'sources.0': {$exists: true}})
        .cursor({batchSize: 1000})
        .exec()
        .eachAsync(async doc => {
            let sources = doc.toObject().sources;
            sources.forEach(source => {
                source.source = source.sourceName;
            });
            doc.sources = sources;
            doc.markModified('sources');
            await doc.save();
            DAO.count++;
        }).then(err => {
        if (err) throw err;
        console.log("Finished " + DAO.name + " Count: " + DAO.count);
        console.log(JSON.stringify(DAO.incorrectMap));
    });
});

