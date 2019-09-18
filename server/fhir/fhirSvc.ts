import { FhirApps, FhirObservationInfo } from 'server/fhir/fhirDb';

const writableCollection = require('server/system/writableCollection').writableCollection;

export const fhirApps = writableCollection(FhirApps);

// _id is own string
export const fhirObservationInfo = writableCollection(FhirObservationInfo, undefined);
