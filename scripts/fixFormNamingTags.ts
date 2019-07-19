import { Form } from '../server/form/mongo-form';

let count = 0;
let cursor = Form.find({}).cursor();

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
