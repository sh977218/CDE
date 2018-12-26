const mongoose = require('mongoose');
require('../system/mongoose-stringtype')(mongoose);
const Schema = mongoose.Schema;
const StringType = Schema.Types.StringType;

const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

let clusterStatus = new Schema({
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
});
const ClusterStatus = conn.model('ClusterStatus', clusterStatus);

exports.getClusterHostStatus = (server, callback) => {
    ClusterStatus.findOne({hostname: server.hostname, port: server.port}, callback);
};

exports.getClusterHostStatuses = callback => {
    ClusterStatus.find({}, callback);
};

exports.updateClusterHostStatus = (status, callback) => {
    status.lastUpdate = new Date();
    ClusterStatus.updateOne({port: status.port, hostname: status.hostname}, status, {upsert: true}, callback);
};
