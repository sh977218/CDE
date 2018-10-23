exports.parseDesignations = protocol => {
    let designations = [{
        designation: protocol.classification[protocol.classification.length - 1],
        tags: []
    }];
    return designations;
};