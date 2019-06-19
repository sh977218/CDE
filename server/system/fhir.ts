import { FhirApps, FhirObservationInfo } from '../../server/system/mongo-data';

const writableCollection = require('./writableCollection').writableCollection;

export const fhirApps = writableCollection(FhirApps);

// _id is own string
export const fhirObservationInfo = writableCollection(FhirObservationInfo, undefined);
