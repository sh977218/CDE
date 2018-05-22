import { newIdentifier } from 'shared/mapping/fhir/to/toFhir';

export function newDevice(accessGUDId, parsedUdi = undefined) {
    let di = accessGUDId.gudid.device;
    let udi = parsedUdi;
    return {
        // contact: di.contacts ? newContacts(di.contacts) : undefined,
        expirationDate: udi && udi.expiration_date ? udi.expiration_date : undefined,
        identifier: [newIdentifier(
            di.identifiers.identifier.deviceIdIssuingAgency,
            di.identifiers.identifier.deviceId,
            di.identifiers.identifier.deviceIdType === 'Primary' ? 'official' : 'usual'
        )],
        udi: {
            deviceIdentifier: di.identifiers.identifier.deviceId,
            name: di.deviceDescription,
        }
    };
}