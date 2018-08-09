const schemas = require('./schemas');
const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.log);
const TrafficFilterModel = conn.model('trafficFilter', schemas.trafficFilterSchema);
const handleError = require('../log/dbLogger').handleError;

let initTrafficFilter = cb => {
    TrafficFilterModel.remove({}, () => new TrafficFilterModel({ipList: []}).save(cb));
};
exports.getTrafficFilter = function (cb) {
    TrafficFilterModel.findOne({}, (err, theOne) => {
        if (err || !theOne) initTrafficFilter((err2, newOne) => cb(newOne));
        else cb(theOne);
    });
};
exports.banIp = function (ip, reason) {
    TrafficFilterModel.findOne({}, handleError({}, theOne => {
        let foundIndex = theOne.ipList.findIndex(r => r.ip === ip);
        if (foundIndex > -1) {
            theOne.ipList[foundIndex].strikes++;
            theOne.ipList[foundIndex].reason = reason;
            theOne.ipList[foundIndex].date = Date.now();
        } else {
            theOne.ipList.push({ip: ip, reason: reason});
        }
        theOne.save(handleError({}, () => {}));
    }));
};
