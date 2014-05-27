var mongo_data = require('./mongo-data')
    , cdesvc = require('./cdesvc');

exports.findSteward = function(de, orgName) {
    for (var i = 0; i < de.classification.length; i++) {
        if (de.classification[i].stewardOrg.name === orgName) {
            return {index:i, object: de.classification[i]};
        }
    }
};
exports.findElement = function(element, name) {
    for (var i = 0; i < element.elements.length; i++) {
        if (element.elements[i].name === name) {
            return {index:i, object: element.elements[i]};
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

exports.removeClassificationFromTree = function(sourceElements, pathElements) {
    if (pathElements.length > 0) {
        for (var i = 0; i < sourceElements.length; i++) {
           if (sourceElements[i].name === pathElements[0]) {
               if (pathElements.length > 1) {
                   pathElements.splice(0, 1);
                   this.removeClassificationFromTree(sourceElements[i].elements, pathElements);
                   if (sourceElements[i].elements.length === 0) {
                       sourceElements.splice(i, 1);
                   }
               } else {
                   sourceElements.splice(i, 1);
               }
           }             
        }
    }
};

exports.addClassificationToCde = function (dat, res) {
    mongo_data.cdeById(dat.deId, function(err, de) {
        if (err) {
            res.statusCode = 404;
            return res.send(err);
        }
        cdesvc.addClassificationToCde(de, dat.classification.orgName, dat.classification.conceptSystem, dat.classification.concept);
        return de.save(function(err) {
            if (err) {
                res.send("error: " + err);
            } else {
                res.send(de);
            }
        });        
    });    
};