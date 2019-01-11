const trimWhite = require('../../shared/utility').trimWhite;

exports.parseDesignations = protocol => {
    let designations = [{
        designation: trimWhite(protocol.classification[protocol.classification.length - 1]),
        tags: []
    }];
    return designations;
};