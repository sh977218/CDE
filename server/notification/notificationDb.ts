import * as mongoose from 'mongoose';
import { config } from 'server/system/parseConfig';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { handleError } from 'server/errorHandler/errorHandler';
import { siteAdmins } from 'server/user/userDb';

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
    userId: StringType,
    vapidKeys: {
        privateKey: StringType,
        publicKey: StringType
    }
}, {collection: 'pushRegistration'});

// tslint:disable-next-line:variable-name
const PushRegistration = conn.model('PushRegistration', pushRegistrationSchema);

export function pushesByEndpoint(endpoint, callback) {
    PushRegistration.find({'subscription.endpoint': endpoint}, callback);
}

export function pushById(id, callback) {
    PushRegistration.findOne({_id: id}, callback);
}

export function pushByIds(endpoint, userId, callback) {
    PushRegistration.findOne({'subscription.endpoint': endpoint, userId}, callback);
}

export function pushByIdsCount(endpoint, userId, callback) {
    PushRegistration.countDocuments({'subscription.endpoint': endpoint, userId}, callback);
}

export function pushByPublicKey(publicKey, callback) {
    PushRegistration.findOne({'vapidKeys.publicKey': publicKey}, callback);
}

export function pushClearDb(callback) {
    PushRegistration.remove({}, callback);
}

export function pushCreate(push, callback) {
    new PushRegistration(push).save(callback);
}

export function pushDelete(endpoint, userId, callback) {
    pushByIds(endpoint, userId, (err, registration) => {
        if (err) {
            return callback(err);
        }
        PushRegistration.remove({_id: registration._id}, callback);
    });
}

export function pushEndpointUpdate(endpoint, commandObj, callback) {
    PushRegistration.updateMany({'subscription.endpoint': endpoint}, commandObj, callback);
}

export function pushGetAdministratorRegistrations(callback) {
    siteAdmins(handleError({}, users => {
        const userIds = users.map(u => u._id.toString());
        PushRegistration.find({}).exec(handleError({}, registrations => {
            callback(registrations.filter(reg => reg.loggedIn === true && userIds.indexOf(reg.userId) > -1));
        }));
    }));
}

// cb(err, registrations)
export function pushRegistrationFindActive(criteria, cb) {
    criteria.loggedIn = true;
    PushRegistration.find(criteria, cb);
}


