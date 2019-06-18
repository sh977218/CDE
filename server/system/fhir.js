const mongo_data = require('./mongo-data');
const writableCollection = require('./writableCollection');

exports.fhirApps = writableCollection(mongo_data.FhirApps);

// _id is own string
exports.fhirObservationInfo = writableCollection(mongo_data.FhirObservationInfo, undefined);
