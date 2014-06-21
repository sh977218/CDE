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
                if ( subTree[i].elements.length == 0) {
                    return subTree[i];
                }
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
    var rtn = false;
    
    for (var i = 0; i < lastLevel.length; i++) {
        if (lastLevel[i].name === fields[fields.length-1]) {
            lastLevel.splice(i,1);
            
            // Returns true if no more elements in clasification
            if( lastLevel.length === 0 ) rtn = true;
            
            break;
        }
    }    
    if (cb) {
        cb();
    }
    
    return rtn;
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

exports.treeChildren = function(tree, path, cb) {
    var classification = this;
    tree.elements.forEach(function(element) {
        var newpath = path.slice(0);
        newpath.push(element.name);
        if (element.elements.length>0) {
            classification.treeChildren(element, newpath, cb);
        } else {
            cb(newpath);
        }
    });
};
exports.transferClassifications = function (source, destination) {
    var classification = this;
    source.classification.forEach(function(stewardOrgSource){
        var st = exports.findSteward(destination, stewardOrgSource.stewardOrg.name);
        if (st) {
            var stewardOrgDestination = st.object;
        } else {
            destination.classification.push({stewardOrg: {name: stewardOrgSource.stewardOrg.name}, elements: []});
            var stewardOrgDestination = destination.classification[destination.classification.length-1];
        }
        stewardOrgDestination.name = stewardOrgDestination.stewardOrg.name;
        classification.treeChildren(stewardOrgSource, [], function(path){
            classification.addCategory(stewardOrgDestination.elements, path, function(){});
        });
    });
};

/**
 * Delete data element classification given an organization name.
 * 
 * @param {type} de - data element
 * @param {type} orgName - organization name
 * @returns none
 */
exports.removeClassification = function(de, orgName) {
    for( var i = 0; i < de.classification.length; i++ ) {
        if( de.classification[i].stewardOrg.name === orgName ) {
            de.classification.splice( i,1 );
            break;
        }
    }
};