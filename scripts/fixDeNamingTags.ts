import { dataElementModel } from 'server/cde/mongo-cde';

let count = 0;
const cursor = dataElementModel.find({}).cursor();

cursor.eachAsync((de) => {
    return new Promise((resolve) => {
        de.designations.forEach(n => {
            n.tags = (n as any).newTags;
        });
        de.markModified('naming');
        de.save(err => {
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
