import {isEmpty, trim} from 'lodash';
import {trimWhite} from '../../shared/utility';

export function parseDesignations(protocol) {
    const designations = [];
    const protocolName = trim(protocol.protocolName.replace('Protocol - ', ''));
    if (!isEmpty(protocolName)) {
        designations.push({
            designation: trimWhite(protocolName),
            tags: []
        });
    }
    return designations;
}
