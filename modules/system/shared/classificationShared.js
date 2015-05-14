if (typeof(exports)==="undefined") exports = {};

exports.actions = {
    create: "create"
    , delete: "delete"
    , rename: "rename"    
};

exports.findSteward = function(de, orgName) {
    if (!de) return null;
    for (var i = 0; i < de.classification.length; i++) {
        if (de.classification[i].stewardOrg.name === orgName) {
            return {index:i, object: de.classification[i]};
        }
    }
};

exports.modifyCategory = function(tree, fields, action, cb) {
    var classification = this;
    var lastLevel = classification.fetchLevel(tree, fields);
    for (var i = 0; i < lastLevel.elements.length; i++) {
        if (lastLevel.elements[i] === null) {
            lastLevel.elements.splice(i, 1);
            i = i - 1;
        }
        if (lastLevel.elements[i].name === fields[fields.length-1]) {
            if (action.type === classification.actions.delete) {
                lastLevel.elements.splice(i,1);
            }
            if (action.type === classification.actions.rename) lastLevel.elements[i].name = action.newname;
            break;
        }
    }
    if (cb) {
        cb();
    }
};

exports.classifyItem = function(item, orgName, classifPath, cb) {
    var steward = exports.findSteward(item, orgName);
    if (!steward) {
        item.classification.push({
            stewardOrg: {
                name: orgName
            }
            , elements: []
        });
        steward = exports.findSteward(item, orgName);
    }  
    for (var i=1; i <= classifPath.length; i++){
        exports.addCategory(steward.object, classifPath.slice(0,i));
    }  
};

exports.addCategory = function(tree, fields, cb) {
    var classification = this;
    var lastLevel = classification.fetchLevel( tree, fields );
    if( classification.isDuplicate( lastLevel.elements, fields[fields.length-1] ) ) {
        if( cb ) return cb({error: {message: "Classification Already Exists"}});
    } else {    
        lastLevel.elements.push( {name: fields[fields.length-1], elements:[]} );
        if (cb) return cb();
    }
};

exports.fetchLevel = function(tree, fields) {
    var classifications = this;
    var tempTree = tree;    
    this.findCategory = function( subTree, name ) {
        for( var i = 0; i<subTree.elements.length; i++ ) {
            if( subTree.elements[i].name === name ) {
                if( !subTree.elements[i].elements) subTree.elements[i].elements = [];
                return subTree.elements[i];
            }
        }
        subTree.elements.push({name: name, elements: []});
        return subTree.elements[subTree.elements.length-1];
    };    
    for( var j=0; j<fields.length-1; j++ ) {
        if( tempTree ) {
            tempTree = classifications.findCategory( tempTree, fields[j] );
        }
    }
    return tempTree;
};

exports.treeChildren = function(tree, path, cb) {
    var classification = this;
    tree.elements.forEach(function(element) {
        var newpath = path.slice(0);
        newpath.push(element.name);
        if (element.elements && element.elements.length>0) {
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
            classification.addCategory(stewardOrgDestination, path, function(){});
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
exports.removeClassification = function(elt, orgName) {
    for( var i = 0; i < elt.classification.length; i++ ) {
        if( elt.classification[i].stewardOrg.name === orgName ) {
            elt.classification.splice(i, 1);
            break;
        }
    }
};

/**
 * Traverse array for duplicates.
 * @param {type} eles - Array of elements to traverse.
 * @param {type} name - Name of duplicate.
 * @returns {Boolean} - True if duplicate found, false otherwise.
 */
exports.isDuplicate = function( eles, name ) {
    for( var i=0; i<eles.length; i++) {
        if( eles[i].name === name ) {
            return true;
        }
    }
    
    return false;
};


exports.sortClassification = function(elt) {
    elt.classification = elt.classification.sort(function(c1, c2) {
        return c1.stewardOrg.name.localeCompare(c2.stewardOrg.name);
    });
    var sortSubClassif = function(classif) {
        if (classif.elements) {
            classif.elements = classif.elements.sort(function (c1, c2) {
                return c1.name.localeCompare(c2.name);
            });
        }
    };
    var doRecurse = function(classif) {
        sortSubClassif(classif);
        if (classif.elements) {
            classif.elements.forEach(function (subElt) {
                doRecurse(subElt);
            });
        }
    };
    elt.classification.forEach(function(classif) {
        doRecurse(classif);
    });
};