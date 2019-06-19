import * as mongoose from 'mongoose';
import { addStringtype } from '../../server/system/mongoose-stringtype';
import { config } from '../../server/system/parseConfig';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

const ClusterStatus = conn.model('ClusterStatus', new Schema({
    hostname: StringType,
    port: Number,
    pmPort: Number,
    nodeStatus: {type: StringType, enum: ["Running", "Stopped"]},
    lastUpdate: Date,
    startupDate: Date,
    elastic: {
        up: Boolean,
        message: StringType,
        indices: [{
            name: StringType,
            up: Boolean,
            message: StringType
        }]
    }
}));

export function getClusterHostStatus(server, callback) {
    ClusterStatus.findOne({hostname: server.hostname, port: server.port}, callback);
}

export function getClusterHostStatuses(callback) {
    ClusterStatus.find({}, callback);
}

export function updateClusterHostStatus(status, callback) {
    status.lastUpdate = new Date();
    ClusterStatus.updateOne({port: status.port, hostname: status.hostname}, status, {upsert: true}, callback);
}
