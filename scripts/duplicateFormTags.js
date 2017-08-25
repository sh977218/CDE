const _ = require('lodash');
const mongo_form = require('../modules/form/node-js/mongo-form');
const FormModal = mongo_form.Form;

let count = 0;
let cursor = FormModal.find({}).cursor();

cursor.eachAsync(function (form) {
    return new Promise(function (resolve) {
        let naming = form.toObject().naming;
        form.naming = _.forEach(naming, n => {
            n.newTags = _.compact(n.tags.map(t => {
                if (t && t.tag) return t.tag;
            }));
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
});
cursor.on('error', function (err) {
    console.log("error: " + err);
    process.exit(1);
});


