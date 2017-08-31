const async = require('async');
const mongo_cde = require('../modules/cde/node-js/mongo-cde');
const mongo_form = require('../modules/form/node-js/mongo-form');
const FormModal = mongo_form.Form;

let count = 0;
let cursor = FormModal.find({}).cursor();

cursor.eachAsync(function (form) {
    return new Promise(function (resolve) {
        form.naming.forEach(n => {
            n.tags = n.newTags;
        });
        form.markModified("naming");
        form.save(err => {
            if (err) throw err;
            count++;
            console.log("count: " + count);
            resolve();
        });
    });
});

cursor.on('close', function () {
    console.log("Finished all. count: " + count);
    process.exit(1);
});
cursor.on('error', function (err) {
    console.log("error: " + err);
    process.exit(1);
});


