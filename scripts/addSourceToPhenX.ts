import { eachSeries } from 'async';
import { Form } from '../server/form/mongo-form';

let count = 0;

Form.find({"classification.stewardOrg.name": "PhenX", archived: false,
    "ids.source": "PhenX"}, (err, pForms) => {

    eachSeries(pForms, (pForm: any, oneDone) => {
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
