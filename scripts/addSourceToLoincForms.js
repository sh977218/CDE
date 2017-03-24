const mongo_form = require('../modules/form/node-js/mongo-form'),
    async = require('async')
;

mongo_form.Form.find({"classification.stewardOrg.name": "PhenX", archived: null,
    "ids.source": "LOINC"}, (err, pForms) => {

        async.eachSeries(pForms, (pForm, oneDone) => {
            if (!pForms.sources) {
                pForms.sources = [];
            }
            if (!pForms.sources.find((src) => src.sourceName === 'LOINC')) {
                pForms.sources.push({
                    sourceName: "LOINC",
                    copyright: {
                        valueFormat: "html",
                        value: "<a href='http://loinc.org/terms-of-use' target='_blank'>Terms of Use</a>"
                    }
                });
                pForms.save(() => {
                    
                    oneDone();
                });
            } else {
                console.log("nothing do to -- " + ++count);
                oneDone();
            }
        });

});
