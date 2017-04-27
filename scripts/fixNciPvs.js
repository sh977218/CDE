const mongo_form = require('../modules/form/node-js/mongo-form'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    async = require('async')
;

let count = 0;

mongo_form.Form.find({"classification.stewardOrg.name": "NCI", archived: false}, (err, pForms) => {

    async.eachSeries(pForms, (pForm, oneDone) => {
        console.log(count++);
        oneDone();
    }, () => {
        console.log("all done");
        process.exit(0);
    });

});
