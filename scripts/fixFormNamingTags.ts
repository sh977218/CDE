import { formModel } from 'server/form/mongo-form';

let count = 0;
const cursor = formModel.find({}).cursor();

cursor.eachAsync((form) => {
    return new Promise((resolve) => {
        form.designations.forEach(n => {
            n.tags = (n as any).newTags;
        });
        form.markModified('naming');
        form.save(err => {
            if (err) {
                throw err;
            }
            count++;
            console.log('count: ' + count);
            resolve();
        });
    });
});

cursor.on('close', () => {
    console.log('Finished all. count: ' + count);
    process.exit(1);
});

cursor.on('error', (err) => {
    console.log('error: ' + err);
    process.exit(1);
});
