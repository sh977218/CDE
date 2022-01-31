import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { config, ObjectId } from 'server';
import { establishConnection } from 'server/system/connections';
import { PushRegistration, PushRegistrationDocument } from 'server/system/mongo-data';
import { addStringtype } from 'server/system/mongoose-stringtype';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const conn = establishConnection(config.database.appData);
const pushRegistrationSchema = new Schema({
    features: [StringType],
    loggedIn: Boolean, // TODO: replace boolean with timestamp for future database cleanups, expirationTime could be null
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
const pushRegistrationModel: Model<PushRegistrationDocument> = conn.model('PushRegistration', pushRegistrationSchema);

export function pushById(id: string): Promise<PushRegistrationDocument> {
    return pushRegistrationModel.findOne({_id: id}).then();
}

export function pushByIds(endpoint: string, userId: ObjectId): Promise<PushRegistrationDocument> {
    return pushRegistrationModel.findOne({'subscription.endpoint': endpoint, userId}).then();
}

export function pushByIdsCount(endpoint: string, userId?: ObjectId): Promise<number> {
    return pushRegistrationModel.countDocuments({'subscription.endpoint': endpoint, userId}).then();
}

export function pushByPublicKey(publicKey: string): Promise<PushRegistrationDocument> {
    return pushRegistrationModel.findOne({'vapidKeys.publicKey': publicKey}).then();
}

export function pushClearDb(): Promise<void> {
    return pushRegistrationModel.deleteMany({}).then();
}

export function pushDelete(endpoint: string, userId: ObjectId): Promise<void> {
    return pushByIds(endpoint, userId).then(registration => {
        if (!registration) {
            return Promise.reject();
        }
        return pushRegistrationModel.deleteOne({_id: registration._id}).then();
    });
}

export function pushEndpointUpdate(endpoint: string, updateObj: any): Promise<void> {
    return pushRegistrationModel.updateMany({'subscription.endpoint': endpoint}, updateObj).then();
}

export function pushesByEndpoint(endpoint: string): Promise<PushRegistrationDocument[]> {
    return pushRegistrationModel.find({'subscription.endpoint': endpoint}).then();
}

export function pushFindActive(criteria: any): Promise<PushRegistrationDocument[]> {
    criteria.loggedIn = true;
    return pushRegistrationModel.find(criteria).then();
}

export function pushSave(push: Partial<PushRegistration>): Promise<PushRegistrationDocument> {
    return new pushRegistrationModel(push).save();
}
