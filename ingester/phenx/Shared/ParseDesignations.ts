import { isEmpty } from 'lodash';
import { trimWhite } from '../../shared/utility';

export function parseDesignations(protocol) {
    let designations = [];
    let protocolName = protocol.protocolName.replace('Protocol - ', '');
    if (!isEmpty(protocolName)) {
        designations.push({
            designation: trimWhite(protocolName),
            tags: []
        })
    }
    return designations;
}