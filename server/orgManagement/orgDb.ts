import * as mongoose from 'mongoose';
import { config } from '../system/parseConfig';
import { addStringtype } from '../system/mongoose-stringtype';
import { csEltSchema, statusValidationRuleSchema } from 'server/system/schemas';

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

export async function allOrganizations() {
    const allOrganizations = await Org.find({}).sort({name: 1});
    return allOrganizations;
}

export async function findOneByName(orgName) {
    const foundOrg = await Org.findOne({name: orgName});
    return foundOrg;
}

export async function saveOrg(org) {
    const savedOrg = await new Org(org).save();
    return savedOrg;
}

export async function updateOrgById(id, org) {
    const updatedOrg = await Org.findOneAndUpdate({_id: id}, org, {new: true});
    return updatedOrg;
}
