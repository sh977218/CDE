import { FhirDevice } from 'shared/mapping/fhir/fhirResource.model';
import { newIdentifier } from 'shared/mapping/fhir/to/toFhir';

export function newDevice(accessGUDId: any, parsedUdi?: any): FhirDevice {
    let di = accessGUDId.gudid.device;
    let udi = parsedUdi;
    return {
        resourceType: 'Device',
        // contact: di.contacts ? newContacts(di.contacts) : undefined,
        expirationDate: udi && udi.expiration_date ? udi.expiration_date : undefined,
        identifier: [
            newIdentifier(
                di.identifiers.identifier.deviceIdIssuingAgency,
                di.identifiers.identifier.deviceId,
                di.identifiers.identifier.deviceIdType === 'Primary' ? 'official' : 'usual'
            ),
        ],
        udi: {
            deviceIdentifier: di.identifiers.identifier.deviceId,
            name: di.deviceDescription,
        },
    };
}
