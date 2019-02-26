const diff = require('deep-diff');

const mongo_cde = require('../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;
const DataElementSource = mongo_cde.DataElementSource;

const classificationShared = require('esm')(module)('../shared/system/classificationShared');


DataElement.find({}, async (err, cdes) => {
    if (err) {
        console.log(err);
        process.exit(1);
    } else {
        for (let cde of cdes) {
            let cdeJson = cde.toObject();
            let source = await DataElementSource.findOne({'ids.id': cdeJson.ids[0].id});
            source.tinyId = cdeJson.tinyId;
            let sourceJson = source.toObject();
            [sourceJson, cdeJson].forEach(o => {
                delete o._id;
                delete valueDomain.uom;
                delete o.created;
                delete o.imported;
                delete o.__v;
                delete o.comment;
                delete o.version;
                delete o.mappingSpecifications;
                let nindsClassification = o.classification.filter(c => c.stewardOrg.name === 'NINDS');
                o.classification = nindsClassification;
                classificationShared.sortClassification(o);
            });
            let changes = diff(sourceJson, cdeJson);
            if (changes) {
                console.log(cdeJson.tinyId + ' is different from source');
                process.exit(1);
            }
        }
    }
});