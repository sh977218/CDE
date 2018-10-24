const _ = require('lodash');

exports.parseDefinitions = nindsForms => {
    let definitionDescriptionArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde.definitionDescription)
                definitionDescriptionArray.push(nindsCde.definitionDescription);
        })
    });

    let _definitionDescriptionArray = _.uniq(definitionDescriptionArray);

    let definitions = [];
    _definitionDescriptionArray.forEach(n => {
        definitions.push({
            definition: n,
            tags: []
        })
    });
    return definitions;
};