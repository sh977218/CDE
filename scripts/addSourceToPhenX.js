const mongo_form = require('../modules/form/node-js/mongo-form'),
    async = require('async')
    ;

let count = 0;

mongo_form.Form.find({"classification.stewardOrg.name": "PhenX", archived: false,
    "ids.source": "PhenX"}, (err, pForms) => {

    async.eachSeries(pForms, (pForm, oneDone) => {
        if (!pForm.sources) {
            pForm.sources = [];
        }
        if (!pForm.sources.find((src) => src.sourceName === 'PhenX')) {
            pForm.sources.push({
                sourceName: "PhenX",
                copyright: {
                    valueFormat: "html",
                    value: "<a href='http://www.phenxtoolkit.org' target='_blank'>http://www.phenxtoolkit.org</a> - January 31, 2017"
                }
            });
            pForm.ids.forEach((id) => {
                if (id.source === 'PhenX') id.version = "20.0";
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
