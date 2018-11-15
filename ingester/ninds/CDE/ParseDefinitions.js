const _ = require('lodash');

exports.parseDefinitions = nindsForms => {
    let definitionDescriptionArray = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.cdes)
            nindsForm.cdes.forEach(nindsCde => {
                if (nindsCde['Definition / Description'])
                    definitionDescriptionArray.push(nindsCde['Definition / Description']);
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