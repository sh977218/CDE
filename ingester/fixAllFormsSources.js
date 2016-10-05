var mongo_form = require('../modules/form/node-js/mongo-form');
var FormModel = mongo_form.Form;

var formCount = 0;

var stream = FormModel.find({}).stream();

stream.on('data', function (form) {
    stream.pause();
    form.sources = [{sourceName: form.source}];
    form.save(function (err) {
        if (err) throw err;
        formCount++;
        console.log("formCount:" + formCount);
        stream.resume();
    })
});

stream.on('error', function (err) {
    if (err) throw err;
});

stream.on('end', function () {
    console.log('end of stream.');
});