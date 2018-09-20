const Schema = require('mongoose').Schema;
const stringType = require('../system/schemas').stringType;
const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

let clusterStatus = new Schema({
    hostname: stringType,
    port: Number,
    pmPort: Number,
    nodeStatus: Object.assign({enum: ["Running", "Stopped"]}, stringType),
    lastUpdate: Date,
    startupDate: Date,
    elastic: {
        up: Boolean,
        message: stringType,
        indices: [{
            name: stringType,
            up: Boolean,
            message: stringType
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
    ClusterStatus.update({port: status.port, hostname: status.hostname}, status, {upsert: true}, callback);
};
