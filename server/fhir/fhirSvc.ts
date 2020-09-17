import { FhirApps, FhirObservationInfo } from 'server/fhir/fhirDb';
import { writableCollection } from 'server/system/writableCollection';

export const fhirApps = writableCollection(FhirApps);

// _id is own string
export const fhirObservationInfo = writableCollection(FhirObservationInfo, undefined);
