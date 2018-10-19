const MeasureModel = require('../../createMigrationConnection').MeasureModel;

const CreateForm = require('../Form/CreateForm');

let measureCount = 0;
let protocolCount = 0;
MeasureModel.find({}).cursor().eachAsync(async measure => {
    measureCount++;
    let measureObj = measure.toObject();
    for (let protocol of measureObj.protocols) {
        protocolCount++;
        let newForm = await CreateForm.createForm(measureObj, protocol.protocol);
        console.log('protocolCount: ' + protocolCount);
    }
    console.log('measureCount: ' + measureCount);
}).then(() => {
}, error => console.log(error));