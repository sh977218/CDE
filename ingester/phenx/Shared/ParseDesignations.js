const trimWhite = require('../../shared/utility').trimWhite;

exports.parseDesignations = protocol => {
    let designations = [{
        designation: protocol.classification[protocol.classification.length - 1].trimWhite(),
        tags: []
    }];
    return designations;
};