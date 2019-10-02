import * as mongoose from 'mongoose';
import { config } from 'server/system/parseConfig';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { csEltSchema, statusValidationRuleSchema } from 'server/system/schemas';
import { errorLogger } from 'server/system/logging';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);
export const orgJson = {
    name: StringType,
    longName: StringType,
    mailAddress: StringType,
    emailAddress: StringType,
    phoneNumber: StringType,
    uri: StringType,
    classifications: [csEltSchema],
    workingGroupOf: StringType,
    propertyKeys: {
        type: Array,
        default: []
    },
    nameContexts: {
        type: Array,
        default: []
    },
    nameTags: {
        type: Array,
        default: []
    },
    extraInfo: StringType,
    cdeStatusValidationRules: [statusValidationRuleSchema],
    htmlOverview: StringType
};
export const orgSchema = new Schema(orgJson, {usePushEach: true});
export const Org = conn.model('Org', orgSchema);
const orgDetailProject = {
    _id: 0,
    name: 1,
    longName: 1,
    mailAddress: 1,
    emailAddress: 1,
    embeds: 1,
    phoneNumber: 1,
    uri: 1,
    workingGroupOf: 1,
    extraInfo: 1,
    cdeStatusValidationRules: 1,
    propertyKeys: 1,
    nameTags: 1,
    htmlOverview: 1
};

export async function managedOrgs() {
    return Org.find({}).sort({name: 1});
}

export function orgByName(orgName, callback?) {
    return Org.findOne({name: orgName}).exec(callback);
}

export function orgNames(callback) {
    Org.find({}, {name: true, _id: false}, callback);
}


export async function allOrgNames() {
    return Org.distinct('name');
}

export function listOrgsLongName(callback) {
    Org.find({}, {_id: 0, name: 1, longName: 1}, callback);
}

export function listOrgsDetailedInfo() {
    return Org.find({}, orgDetailProject);
}

export function findOrCreateOrg(newOrg, cb) {
    Org.findOne({name: newOrg.name}).exec((err, found) => {
        if (err) {
            cb(err);
            errorLogger.error('Cannot add org.',
                {
                    origin: 'system.mongo.addOrg',
                    stack: new Error().stack,
                    details: 'orgName: ' + newOrg.name + 'Error: ' + err
                });
        } else if (found) {
            cb(null, found);
        } else {
            newOrg = new Org(newOrg);
            newOrg.save(cb);
        }
    });
}

export async function addOrgByName(newOrg) {
    return new Org(newOrg).save();
}

export function removeOrgById(id, callback) {
    Org.remove({_id: id}, callback);
}

export function updateOrg(org, res) {
    const id = org._id;
    delete org._id;
    Org.findOneAndUpdate({_id: id}, org, {new: true}, (err, found) => {
        if (err || !found) {
            res.status(500).send('Could not update');
        } else {
            res.send();
        }
    });
}
