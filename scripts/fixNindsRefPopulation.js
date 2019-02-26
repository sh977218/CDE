const mongo_cde = require('../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;
const DataElementSource = mongo_cde.DataElementSource;

const classificationShared = require('esm')(module)('../shared/system/classificationShared');

let count = 0;

let cursor = DataElement.find({archived: false, 'classification.stewardOrg.name': 'NINDS'}).cursor();

cursor.eachAsync(function (cde) {
    return new Promise(function (resolve) {
        let cdeObject = cde.toObject();
        let id = '';
        cdeObject.ids.forEach(i => {
            if (i.source === 'NINDS') id = i.id;
        });
        if (!id) {
            console.log(cdeObject.tinyId + ' does not have ninds id.');
            process.exit(1);
        } else {
            DataElementSource.findOne({'ids.id': id}, (err, source) => {
                if (err) {
                    console.log(err);
                    process.exit(1);
                } else {
                    let sourceObject = source.toObject();
                    if (cdeObject.referenceDocuments.length !== sourceObject.referenceDocuments.length) {
                        console.log(cdeObject.tinyId + ' ref is not same');
                        process.exit(1);
                    } else {
                        cde.referenceDocuments = sourceObject.referenceDocuments;
                    }
                    sourceObject.classification.forEach(c => {
                        c.elements.forEach(e => {
                            if (e.name === 'Population') {
                                e.elements.forEach(p => {
                                    let populationToAdd = ['Population'];
                                    populationToAdd.push(p.name);
                                    classificationShared.classifyItem(item, "NINDS", populationToAdd);
                                })
                            }
                        })
                    })

                }
            })
        }
    });
});

cursor.on('close', function () {
    console.log("Finished all. count: " + count);
    process.exit(1);
});
cursor.on('error', function (err) {
    console.log("error: " + err);
    process.exit(1);
});


