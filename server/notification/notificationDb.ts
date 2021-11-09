import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'server';
import { config } from 'server/system/parseConfig';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { handleError } from 'server/errorHandler/errorHandler';
import { Cb1, CbError, CbError1, User } from 'shared/models.model';
import { PushRegistration, PushRegistrationDocument } from 'server/system/mongo-data';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

const pushRegistrationSchema = new Schema({
    features: [StringType],
    loggedIn: Boolean,
    subscription: {
        endpoint: StringType,
        expirationTime: StringType,
        keys: {
            auth: StringType,
            p256dh: StringType
        }
    },
    userId: Schema.Types.ObjectId,
    vapidKeys: {
        privateKey: StringType,
        publicKey: StringType
    }
}, {collection: 'pushRegistration'});

// tslint:disable-next-line:variable-name
const pushRegistrationModel: Model<PushRegistrationDocument> = conn.model('PushRegistration', pushRegistrationSchema);

export function pushById(id: string, callback: CbError1<PushRegistrationDocument>) {
    pushRegistrationModel.findOne({_id: id}, callback);
}

export function pushByIds(endpoint: string, userId: string, callback: CbError1<PushRegistrationDocument>) {
    pushRegistrationModel.findOne({'subscription.endpoint': endpoint, userId}, callback);
}

export function pushByIdsCount(endpoint: string, userId: string | undefined, callback: CbError1<number>) {
    pushRegistrationModel.countDocuments({'subscription.endpoint': endpoint, userId}, callback);
}

export function pushByPublicKey(publicKey: string, callback: CbError1<PushRegistrationDocument>) {
    pushRegistrationModel.findOne({'vapidKeys.publicKey': publicKey}, callback);
}

export function pushClearDb(callback: CbError) {
    pushRegistrationModel.remove({}, callback);
}

export function pushDelete(endpoint: string, userId: string, callback: CbError) {
    pushByIds(endpoint, userId, (err, registration) => {
        if (err || !registration) {
            return callback(err);
        }
        pushRegistrationModel.remove({_id: registration._id}, callback);
    });
}

export function pushEndpointUpdate(endpoint: string, commandObj: any, callback: CbError) {
    pushRegistrationModel.updateMany({'subscription.endpoint': endpoint}, commandObj, callback);
}

export function pushesByEndpoint(endpoint: string, callback: CbError1<PushRegistrationDocument[]>) {
    pushRegistrationModel.find({'subscription.endpoint': endpoint}, callback);
}

export function pushFindActive(criteria: any, cb: CbError1<PushRegistrationDocument[]>) {
    criteria.loggedIn = true;
    pushRegistrationModel.find(criteria, cb);
}

export function pushRegistrationsFor(getUsers: (usersCb: CbError1<User[]>) => void, cb: Cb1<PushRegistrationDocument[]>) {
    getUsers(handleError({}, users => {
        if (!users) {
            return cb([]);
        }
        const userIds: ObjectId[] = users.map(u => u._id);
        pushRegistrationModel.find({}).exec(handleError({}, registrations => {
            cb(Array.isArray(registrations) ? registrations.filter(reg => reg.loggedIn === true && userIds.indexOf(reg.userId) > -1) : []);
        }));
    }));
}

export function pushSave(push: Partial<PushRegistration>, callback: CbError1<PushRegistrationDocument>) {
    new pushRegistrationModel(push).save(callback);
}
