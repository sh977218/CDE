const async = require('async');
const mongo_cde = require('../modules/cde/node-js/mongo-cde');
const DataElementModal = mongo_cde.DataElement;

let count = 0;
let cond = {archived: false, classification: {$size: 0}};
DataElementModal.find(cond, (err, dataElements) => {
    if (err) throw err;
    async.forEach(dataElements, (dataElement, doneOneDataElement) => {
            let de = dataElement.toObject();
            let history = de.history;
            if (history && history.length > 0) {
                async.forEach(history, (h, doneOneH) => {
                    DataElementModal.findById(h, (err, d) => {
                        if (err) throw err;
                        d.remove((err) => {
                            if (err) throw err;
                            count++;
                            doneOneH();
                        });
                    });
                }, () => {
                    dataElement.remove((err) => {
                        if (err) throw err;
                        count++;
                        doneOneDataElement();
                    });
                });
            } else dataElement.remove((err) => {
                if (err) throw err;
                count++;
                doneOneDataElement();
            });
        },
        () => {
            console.info("Finished all. count: " + count);
        });
});
