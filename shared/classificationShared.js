if (typeof(exports)==="undefined") exports = {};

exports.findSteward = function(de, orgName) {
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
        if (lastLevel.elements[i].name === fields[fields.length-1]) {
            if (action === "delete") lastLevel.elements.splice(i,1);
            if (action === "rename") lastLevel.elements[i].name = "newname";
            break;
        }
    }
    if (cb) {
        cb();
    }
};


exports.addCategory = function(tree, fields, cb) {
    var classification = this;
    var lastLevel = classification.fetchLevel( tree, fields );
    if( classification.isDuplicate( lastLevel.elements, fields[fields.length-1] ) ) {
        if( cb ) return cb({error: {message: "Classification Already Exists"}});
    } else {    
        lastLevel.elements.push( {name: fields[fields.length-1], elements:[]} );
    }
    if (cb) cb();
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
exports.removeClassification = function(de, orgName) {
    for( var i = 0; i < de.classification.length; i++ ) {
        if( de.classification[i].stewardOrg.name === orgName ) {
            de.classification.splice(i, 1);
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