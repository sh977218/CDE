const fs = require('fs');

const Form = require('../server/form/mongo-form').Form;

async function run() {
    let filePath = './phenx.csv';
    let header = ['NLM Id', 'PhenX Id', 'URL'];
    let csvHeader = header.join(',') + '\n';
    let forms = await Form.find({
        'archived': false,
        'ids.source': 'PhenX',
        'registrationState.registrationStatus': {$ne: 'Retired'}
    }).lean();
    let rows = forms.map(form => {
        let fields = [form.tinyId, 'PX' + form.ids[0].id, 'https://cde.nlm.nih.gov/formView?tinyId=' + form.tinyId];
        return fields.join(',');
    });
    let data = csvHeader + rows.join('\n');
    fs.writeFile(filePath, data, function (err) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log('PhenX.csv is saved.');
    });
}


run().then(() => {
}, err => console.log(err));