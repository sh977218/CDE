exports.findSteward = function(de, orgName) {
    for (var i = 0; i < de.classification.length; i++) {
        if (de.classification[i].stewardOrg.name === orgName) {
            return {index:i, object: de.classification[i]};
        }
    }
};
exports.findConcept = function(system, name) {
    for (var i = 0; i < system.elements.length; i++) {
        if (system.elements[i].name === name) {
            return {index:i, object: system.elements[i]};
        }
    }
};
exports.addElement = function (conceptSystem, concept) {
    var newConcept = {
        name: concept,
        elements: []
    };
    if(!conceptSystem.elements) conceptSystem.elements = [];
    conceptSystem.elements.push(newConcept);                    
    return {index:0, object: conceptSystem.elements[conceptSystem.elements.length-1]};
};
