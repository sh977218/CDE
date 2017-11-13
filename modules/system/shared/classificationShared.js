import _ from 'lodash';

export const actions = {
    create: "create",
    delete: "delete",
    rename: "rename"
};


export const findLeaf = function (classification, categories) {
    var notExist = false;
    var leaf = classification;
    var parent = classification;
    var index = null;
    categories.forEach(function (category, i) {
        index = i;
        var found = _.find(leaf.elements, function (element) {
            return element.name === category;
        });
        if (i === categories.length - 2) parent = found;
        if (!found) notExist = true;
        leaf = found;
    });
    if (notExist) return null;
    else return {
        leaf: leaf,
        parent: parent
    };
};

export const addCategoriesToTree = function (tree, categories) {
    var temp = tree;
    categories.forEach(function (category) {
        if (!temp.elements) temp.elements = [];
        var found = _.find(temp.elements, function (element) {
            return element.name === category;
        });
        if (!found) {
            temp.elements.push({name: category, elements: []});
        }
        temp = _.find(temp.elements, function (element) {
            return element.name === category;
        });
    });
};
export const addCategoriesToOrg = function (org, categories) {
    if (!org.classifications) org.classifications = [];
    var found = _.find(org.classifications, function (o) {
        return o.name === categories[0];
    });
    if (!found) org.classifications.push({name: categories[0], elements: []})
    found = _.find(org.classifications, function (o) {
        return o.name === categories[0];
    });
    addCategoriesToTree(found, _.slice(categories, 1));
};

export const arrangeClassification = function (item, orgName) {
    var index = _.findIndex(item.classification, function (o) {
        return o.stewardOrg.name === orgName;
    });
    item.classification.splice(0, 0, item.classification.splice(index, 1)[0]);
};

export const classifyElt = function (item, orgName, categories) {
    var classification = _.find(item.classification, function (o) {
        return o.stewardOrg && o.stewardOrg.name === orgName;
    });
    if (!classification) {
        item.classification.push({
            stewardOrg: {name: orgName},
            elements: []
        });
        classification = _.find(item.classification, function (o) {
            return o.stewardOrg && o.stewardOrg.name === orgName;
        });
    }
    addCategoriesToTree(classification, categories);
    arrangeClassification(item, orgName);
    item.updated = new Date();
    if (item.markModified) item.markModified("classification");
};

export const unclassifyElt = function (item, orgName, categories) {
    var classification = _.find(item.classification, function (o) {
        return o.stewardOrg && o.stewardOrg.name === orgName;
    });
    if (classification) {
        var leaf = findLeaf(classification, categories);
        if (leaf) {
            leaf.parent.elements.splice(leaf.index, 1);
            item.updated = new Date();
            if (item.markModified) item.markModified("classification");
        }
    }
};

export const renameClassifyElt = function (item, orgName, categories, newName) {
    var classification = _.find(item.classification, function (o) {
        return o.stewardOrg && o.stewardOrg.name === orgName;
    });
    if (classification) {
        var leaf = findLeaf(classification, categories);
        if (leaf) {
            leaf.leaf.name = newName;
            item.updated = new Date();
            arrangeClassification(item, orgName);
            if (item.markModified) item.markModified("classification");
        }
    }
};

// PUT NEW API ABOVE

export const findSteward = function (de, orgName) {
    if (!de) return null;
    for (var i = 0; i < de.classification.length; i++) {
        if (de.classification[i].stewardOrg.name === orgName) {
            return {index: i, object: de.classification[i]};
        }
    }
};
export const deleteCategory = function (tree, fields) {
    var classification = this;
    var lastLevel = classification.fetchLevel(tree, fields);
    for (var i = 0; i < lastLevel.elements.length; i++) {
        if (lastLevel.elements[i] === null) {
            lastLevel.elements.splice(i, 1);
            i = i - 1;
        }
        if (lastLevel.elements[i].name === fields[fields.length - 1]) {
            lastLevel.elements.splice(i, 1);
            break;
        }
    }
};
export const renameCategory = function (tree, fields, newName) {
    var classification = this;
    var lastLevel = classification.fetchLevel(tree, fields);
    for (var i = 0; i < lastLevel.elements.length; i++) {
        if (lastLevel.elements[i] === null) {
            lastLevel.elements.splice(i, 1);
            i = i - 1;
        }
        if (lastLevel.elements[i].name === fields[fields.length - 1]) {
            lastLevel.elements[i].name = newName;
            break;
        }
    }
};

export const modifyCategory = function (tree, fields, action, cb) {
    var classification = this;
    var lastLevel = classification.fetchLevel(tree, fields);
    for (var i = 0; i < lastLevel.elements.length; i++) {
        if (lastLevel.elements[i] === null) {
            lastLevel.elements.splice(i, 1);
            i = i - 1;
        }
        if (lastLevel.elements[i].name === fields[fields.length - 1]) {
            if (action.type === classification.actions.delete)
                lastLevel.elements.splice(i, 1);
            if (action.type === classification.actions.rename)
                lastLevel.elements[i].name = action.newname;
            break;
        }
    }
    if (cb) {
        cb();
    }
};

export const removeCategory = function (tree, fields, cb) {
    var classification = this;
    var lastLevel = classification.fetchLevel(tree, fields);
    for (var i = 0; i < lastLevel.elements.length; i++) {
        if (lastLevel.elements[i] === null) {
            lastLevel.elements.splice(i, 1);
            i = i - 1;
        }
        if (lastLevel.elements[i].name === fields[fields.length - 1]) {
            lastLevel.elements.splice(i, 1);
            return cb();
        }
    }
    return cb("Did not find match classifications.");
};

export const classifyItem = function (item, orgName, classifPath) {
    var steward = findSteward(item, orgName);
    if (!steward) {
        item.classification.push({
            stewardOrg: {
                name: orgName
            },
            elements: []
        });
        steward = findSteward(item, orgName);
    }
    for (var i = 1; i <= classifPath.length; i++) {
        addCategory(steward.object, classifPath.slice(0, i));
    }
};
export const addCategory = function (tree, fields, cb) {
    var classification = this;
    var lastLevel = classification.fetchLevel(tree, fields);
    if (classification.isDuplicate(lastLevel.elements, fields[fields.length - 1])) {
        if (cb) return cb("Classification Already Exists");
    } else {
        lastLevel.elements.push({name: fields[fields.length - 1], elements: []});
        if (cb) return cb();
    }
};

export const fetchLevel = function (tree, fields) {
    var classifications = this;
    var tempTree = tree;
    this.findCategory = function (subTree, name) {
        for (var i = 0; i < subTree.elements.length; i++) {
            if (subTree.elements[i].name === name) {
                if (!subTree.elements[i].elements) subTree.elements[i].elements = [];
                return subTree.elements[i];
            }
        }
        subTree.elements.push({name: name, elements: []});
        return subTree.elements[subTree.elements.length - 1];
    };
    for (var j = 0; j < fields.length - 1; j++) {
        if (tempTree) {
            tempTree = classifications.findCategory(tempTree, fields[j]);
        }
    }
    return tempTree;
};

export const treeChildren = function (tree, path, cb) {
    var classification = this;
    tree.elements.forEach(function (element) {
        var newpath = path.slice(0);
        newpath.push(element.name);
        if (element.elements && element.elements.length > 0) {
            classification.treeChildren(element, newpath, cb);
        } else {
            cb(newpath);
        }
    });
};

export const transferClassifications = function (source, destination) {
    var classification = this;
    source.classification.forEach(function (stewardOrgSource) {
        var st = findSteward(destination, stewardOrgSource.stewardOrg.name);
        var stewardOrgDestination;
        if (st) {
            stewardOrgDestination = st.object;
        } else {
            destination.classification.push({stewardOrg: {name: stewardOrgSource.stewardOrg.name}, elements: []});
            stewardOrgDestination = destination.classification[destination.classification.length - 1];
        }
        stewardOrgDestination.name = stewardOrgDestination.stewardOrg.name;
        classification.treeChildren(stewardOrgSource, [], function (path) {
            classification.addCategory(stewardOrgDestination, path, function () {
            });
        });
    });
};

/**
 * Delete data element classification given an organization name.
 *
 * @param {type} elt - data element or form
 * @param {type} orgName - organization name
 * @returns none
 */
export const removeClassification = function (elt, orgName) {
    for (var i = 0; i < elt.classification.length; i++) {
        if (elt.classification[i].stewardOrg.name === orgName) {
            elt.classification.splice(i, 1);
            break;
        }
    }
};

/**
 * Traverse array for duplicates.
 * @param {type} elements - Array of elements to traverse.
 * @param {type} name - Name of duplicate.
 * @returns {Boolean} - True if duplicate found, false otherwise.
 */
export const isDuplicate = function (elements, name) {
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].name === name) {
            return true;
        }
    }
    return false;
};


export const sortClassification = function (elt) {
    elt.classification = elt.classification.sort(function (c1, c2) {
        return c1.stewardOrg.name.localeCompare(c2.stewardOrg.name);
    });
    var sortSubClassif = function (classif) {
        if (classif.elements) {
            classif.elements = classif.elements.sort(function (c1, c2) {
                return c1.name.localeCompare(c2.name);
            });
        }
    };
    var doRecurse = function (classif) {
        sortSubClassif(classif);
        if (classif.elements) {
            classif.elements.forEach(function (subElt) {
                doRecurse(subElt);
            });
        }
    };
    elt.classification.forEach(function (classif) {
        doRecurse(classif);
    });
};
