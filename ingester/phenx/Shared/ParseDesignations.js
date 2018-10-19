exports.parseDesignations = protocol => {
    let designations = [];
    designation = [{
        designation: protocol.classification[protocol.classification.length - 1],
        tags: []
    }];
    return designations;
};