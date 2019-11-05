import * as mongoose from 'mongoose';
import { Document, Model } from 'mongoose';
import { config } from 'server/system/parseConfig';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { csEltSchema, statusValidationRuleSchema } from 'server/system/schemas';
import { Organization } from 'shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);
export const orgSchema = new Schema({
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
}, {usePushEach: true});
export type OrganizationDocument = Document & Organization;

export const organizationModel: Model<OrganizationDocument> = conn.model('Org', orgSchema);
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
    return organizationModel.find({}).sort({name: 1});
}

export function orgByName(orgName: string, callback?) {
    return organizationModel.findOne({name: orgName}).exec(callback);
}

export function listOrgsDetailedInfo() {
    return organizationModel.find({}, orgDetailProject);
}

export async function addOrgByName(newOrg: Organization) {
    return new organizationModel(newOrg).save();
}

export function updateOrg(org: Organization, res) {
    const id = org._id;
    delete org._id;
    organizationModel.findOneAndUpdate({_id: id}, org, {new: true}, (err, found) => {
        if (err || !found) {
            res.status(400).send('Could not update');
        } else {
            res.send();
        }
    });
}
