const mongo_data = require('./mongo-data');
const timestamped = require('./timestamped');

exports.fhirApps = timestamped(mongo_data.FhirApps);
exports.fhirObservationInfo = timestamped(mongo_data.FhirObservationInfo, true);
