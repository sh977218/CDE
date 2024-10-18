import * as mongoose from 'mongoose';
import { Document, Model, Schema } from 'mongoose';
import { config } from 'server';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { establishConnection } from 'server/system/connections';
import { TrafficFilter } from 'shared/security/trafficFilter';

addStringtype(mongoose);

const conn = establishConnection(config.database.appData);
export const trafficFilterSchema = new Schema(
    {
        ipList: [
            {
                ip: String,
                date: { type: Date, default: Date.now() },
                reason: String,
                strikes: { type: Number, default: 1 },
            },
        ],
    },
    {}
);

const trafficFilterModel: Model<Document & TrafficFilter> = conn.model('trafficFilter', trafficFilterSchema) as any;

export async function initTrafficFilter(): Promise<Document & TrafficFilter> {
    await trafficFilterModel.deleteMany({});
    return new trafficFilterModel({ ipList: [] }).save();
}

export function findAnyOne(): Promise<(Document & TrafficFilter) | null> {
    return trafficFilterModel.findOne({});
}
