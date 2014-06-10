if (typeof(exports)==="undefined") exports = {};

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

exports.fetchLastLevel = function(tree, fields, mode) {
    var classifications = this;
    var subTree = tree;
    this.findCategory = function(subTree, catname) {
        for (var i = 0; i<subTree.length; i++) {
            if (subTree[i].name === catname) {
                if (!subTree[i].elements) subTree[i].elements = [];
                return subTree[i].elements;
            }
        }
        if (mode === "create") {
            subTree.push({name: catname, elements: []});
            return subTree[subTree.length-1].elements;
        }
        return null;
    };
    for (var j = 0; j<fields.length-1; j++) {
        if (subTree) subTree = classifications.findCategory(subTree, fields[j]);
    }
    return subTree;
};

exports.deleteCategory = function(tree, fields, cb) {
    var classification = this;
    var lastLevel = classification.fetchLastLevel(tree, fields);
    for (var i = 0; i < lastLevel.length; i++) {
        if (lastLevel[i].name === fields[fields.length-1]) {
            lastLevel.splice(i,1);
            break;
        }
    }    
    if (cb) cb();
};

exports.addCategory = function(tree, fields, cb) {
    var classification = this;
    var lastLevel = classification.fetchLastLevel(tree, fields, "create");
    for (var i=0; i<lastLevel.length; i++) {
        if (lastLevel[i].name === fields[fields.length-1]) { 
            if (cb) return cb("Cannot Delete");
        }
    }
    if (lastLevel) lastLevel.push({name: fields[fields.length-1], elements:[]});
    if (cb) cb();
};

 exports.addList = function(request, cb) {
    var classification = this;
    var mongo_data = require('../node-js/mongo-data');
    mongo_data.cdeById(request.cde._id, function(err, cde) {
        request.classifications.forEach(function(c) {
            var steward = classification.findSteward(cde, c[0]);
            if (!steward) {
                cde.classification.push({
                    stewardOrg: {
                        name: c[0]
                    }
                    , elements: []
                });
                steward = classification.findSteward(cde, c[0]);
            }        
            classification.addCategory(steward.object.elements, c.slice(1), function(err) {   
            });             
        });
        cde.markModified('classification');
        cde.save(function() {
            if (cb) cb(err);
        });         
        console.log(cde);
    });
 };