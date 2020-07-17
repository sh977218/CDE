import * as mongoose from 'mongoose';
import { Document, Model, Schema } from 'mongoose';
import { config } from 'server/system/parseConfig';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { establishConnection } from 'server/system/connections';
import { TrafficFilter } from 'shared/system/trafficFilter';

addStringtype(mongoose);

const conn = establishConnection(config.database.appData);
export const trafficFilterSchema = new Schema({
    ipList: [
        {
            ip: String,
            date: {type: Date, default: Date.now()},
            reason: String,
            strikes: {type: Number, default: 1}
        }
    ]
}, {usePushEach: true});

const trafficFilterModel: Model<Document & TrafficFilter> = conn.model('trafficFilter', trafficFilterSchema);

export async function initTrafficFilter() {
    trafficFilterModel.remove({});
    return new trafficFilterModel({ipList: []}).save();
}

export function findAnyOne() {
    return trafficFilterModel.findOne({}).exec();
}
