const mongo_form = require('../modules/form/node-js/mongo-form'),
    async = require('async')
;

let count = 0;

mongo_form.Form.find({"classification.stewardOrg.name": "PhenX", archived: null,
    "ids.source": "LOINC"}, (err, pForms) => {

        async.eachSeries(pForms, (pForm, oneDone) => {
            if (!pForm.sources) {
                pForm.sources = [];
            }
            if (!pForm.sources.find((src) => src.sourceName === 'LOINC')) {
                pForm.sources.push({
                    sourceName: "LOINC",
                    copyright: {
                        valueFormat: "html",
                        value: "<a href='http://loinc.org/terms-of-use' target='_blank'>Terms of Use</a>"
                    }
                });
                pForm.save(() => {
                    console.log("done " + ++count);
                    oneDone();
                });
            } else {
                console.log("nothing do to -- " + ++count);
                oneDone();
            }
        });

});
