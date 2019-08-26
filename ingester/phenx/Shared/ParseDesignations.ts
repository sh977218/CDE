import { trimWhite } from 'ingester/shared/utility'

export function parseDesignations(protocol) {
    return [{
        designation: trimWhite(protocol.classification[protocol.classification.length - 1]),
        tags: []
    }];
}