const _ = require('lodash');

exports.mergeDefinitions = (existingDefinitions, newDefinitions) => {
    let allDefinitions = existingDefinitions.concat(newDefinitions)
    let uniqDefinitions = _.uniqWith(allDefinitions, (a, b) => {
        if (a.definition === b.definition && a.definitionFormat === b.definitionFormat) {
            a.tags = _.uniq(a.tags.concat(b.tags));
            return true;
        }
        return false;
    });
    return uniqDefinitions;
};