import { Model } from 'mongoose';
import { userModel, UserDocument } from 'server/user/userDb';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function doOneCollection(collection: Model<UserDocument>) {
    const cond = {};
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async model => {
        const modelObj = model.toObject();
        if (Array.isArray(modelObj.roles)) {
            model.roles = modelObj.roles.filter((r: any) => r !== 'AttachmentReviewer');
        }
        await model.save();
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
