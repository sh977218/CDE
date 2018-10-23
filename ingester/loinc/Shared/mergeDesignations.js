const _ = require('lodash');

exports.mergeDesignations = (existingDesignations, newDesignations) => {
    let allDesignations = existingDesignations.concat(newDesignations);
    let uniqDesignations = _.uniqWith(allDesignations, (a, b) => {
        if (a.designation === b.designation) {
            a.tags = _.uniq(a.tags.concat(b.tags));
            return true;
        }
        return false;
    });

    return uniqDesignations;
};