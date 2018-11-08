const fs = require('fs');
const generate = require('csv-generate');

const Form = require('../server/form/mongo-form').Form;

async function run() {
    let wstream = fs.createWriteStream('./phenx.csv');
    let forms = await Form.find().lean();
    generate({
        columns: [], length: 3
    }).pipe(wstream);
}


run().then(() => {
}, err => console.log(err));