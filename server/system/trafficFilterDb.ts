import * as mongoose from 'mongoose';
import { config } from '../system/parseConfig';
import { addStringtype } from '../system/mongoose-stringtype';

addStringtype(mongoose);
const Schema = mongoose.Schema;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);
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

const trafficFilterModel = conn.model('trafficFilter', trafficFilterSchema);

export async function initTrafficFilter() {
    trafficFilterModel.remove({});
    return new trafficFilterModel({ipList: []}).save();
}

export async function findAnyOne() {
    return trafficFilterModel.findOne({});
}



