import { trimWhite } from '../../shared/utility';

export function parseDesignations(protocol) {
    let designations = [];
    let protocolName = protocol.protocolName.replace('Protocol - ', '');
    if (protocolName) {
        designations.push({
            designation: trimWhite(protocolName),
            tags: []
        })
    }
    return designations;
}