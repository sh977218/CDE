import * as mongoose from 'mongoose';
import { config } from 'server/system/parseConfig';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { handleError } from 'server/errorHandler/errorHandler';
import { siteAdmins } from 'server/user/userDb';
import { Cb1, CbError, CbError1 } from 'shared/models.model';
import { PushRegistration, PushRegistrationDocument } from 'server/system/mongo-data';
import { Model } from 'mongoose';

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
const pushRegistrationModel: Model<PushRegistrationDocument> = conn.model('PushRegistration', pushRegistrationSchema);

export function pushesByEndpoint(endpoint: string, callback: CbError<PushRegistrationDocument[]>) {
    pushRegistrationModel.find({'subscription.endpoint': endpoint}, callback);
}

export function pushById(id: string, callback: CbError<PushRegistrationDocument>) {
    pushRegistrationModel.findOne({_id: id}, callback);
}

export function pushByIds(endpoint: string, userId: string, callback: CbError<PushRegistrationDocument>) {
    pushRegistrationModel.findOne({'subscription.endpoint': endpoint, userId}, callback);
}

export function pushByIdsCount(endpoint: string, userId: string | undefined, callback: CbError<number>) {
    pushRegistrationModel.countDocuments({'subscription.endpoint': endpoint, userId}, callback);
}

export function pushByPublicKey(publicKey: string, callback: CbError<PushRegistrationDocument>) {
    pushRegistrationModel.findOne({'vapidKeys.publicKey': publicKey}, callback);
}

export function pushClearDb(callback: CbError) {
    pushRegistrationModel.remove({}, callback);
}

export function pushCreate(push: Partial<PushRegistration>, callback: CbError1<PushRegistrationDocument>) {
    new pushRegistrationModel(push).save(callback);
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

export function pushGetAdministratorRegistrations(callback: Cb1<PushRegistrationDocument[]>) {
    siteAdmins(handleError({}, users => {
        if (!users) {
            return callback([]);
        }
        const userIds: string[] = users.map(u => u._id.toString());
        pushRegistrationModel.find({}).exec(handleError({}, registrations => {
            callback(registrations ? registrations.filter(reg => reg.loggedIn === true && userIds.indexOf(reg.userId) > -1) : []);
        }));
    }));
}

export function pushRegistrationFindActive(criteria: any, cb: CbError1<PushRegistrationDocument[]>) {
    criteria.loggedIn = true;
    pushRegistrationModel.find(criteria, cb);
}


