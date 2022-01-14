import { fhirAppsModel, fhirObservationInfoModel } from 'server/fhir/fhirDb';
import { writableCollection } from 'server/system/writableCollection';

export const fhirApps = writableCollection(fhirAppsModel as any);

// _id is own string
export const fhirObservationInfo = writableCollection(fhirObservationInfoModel as any, undefined);
