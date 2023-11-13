import 'server/globals';
import { userModel } from 'server/user/userDb';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function doOneCollection(collection: typeof userModel) {
    const cond = {};
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async doc => {
        const user = doc.toObject();
        doc.createdDate = user._id.getTimestamp();
        await doc.save();
    });
}

function run() {
    const tasks = [userModel]
        .map(model => doOneCollection(model));
    Promise.all(tasks).then(() => {
        console.log('done');
        process.exit(0);
    }, err => {
        console.log('err ' + err);
        process.exit(1);
    });
}

run();
