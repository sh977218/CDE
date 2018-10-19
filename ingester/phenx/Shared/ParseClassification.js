const _ = require('lodash');

exports.parseClassification = measure => {
    let classification = [{stewardOrg: {name: 'PhenX'}, elements: []}];
    let classificationArray = measure.classification;
    let uniqueClassifications = _.uniq(classificationArray);

    let elements = classification[0].elements;
    _.forEach(uniqueClassifications, c => {
        elements.push({
            name: c,
            elements: []
        });
        elements = elements[0].elements;
    });
    return classification;
};