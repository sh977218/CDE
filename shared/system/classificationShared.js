import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';
import _slice from 'lodash/slice';

export const actions = {
    create: 'create',
    delete: 'delete',
    rename: 'rename'
};


export function findLeaf(classification, categories) {
    let notExist = false;
    let leaf = classification;
    let parent = classification;
    let index = null;
    categories.forEach(function (category, i) {
        index = i;
        let found = _find(leaf.elements, function (element) {
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
}

export function addCategoriesToTree(tree, categories) {
    let temp = tree;
    categories.forEach(function (category) {
        if (!temp.elements) temp.elements = [];
        let found = _find(temp.elements, function (element) {
            return element.name === category;
        });
        if (!found) {
            temp.elements.push({name: category, elements: []});
        }
        temp = _find(temp.elements, function (element) {
            return element.name === category;
        });
    });
}

export function addCategoriesToOrg(org, categories) {
    if (!org.classifications) org.classifications = [];
    let found = _find(org.classifications, function (o) {
        return o.name === categories[0];
    });
    if (!found) org.classifications.push({name: categories[0], elements: []})
    found = _find(org.classifications, function (o) {
        return o.name === categories[0];
    });
    addCategoriesToTree(found, _slice(categories, 1));
}

export function arrangeClassification(item, orgName) {
    let index = _findIndex(item.classification, function (o) {
        return o.stewardOrg.name === orgName;
    });
    item.classification.splice(0, 0, item.classification.splice(index, 1)[0]);
}

export function classifyElt(item, orgName, categories) {
    let classification = _find(item.classification, function (o) {
        return o.stewardOrg && o.stewardOrg.name === orgName;
    });
    if (!classification) {
        item.classification.push({
            stewardOrg: {name: orgName},
            elements: []
        });
        classification = _find(item.classification, function (o) {
            return o.stewardOrg && o.stewardOrg.name === orgName;
        });
    }
    addCategoriesToTree(classification, categories);
    arrangeClassification(item, orgName);
    item.updated = new Date();
    if (item.markModified) item.markModified('classification');
}

export function unclassifyElt(item, orgName, categories) {
    let classification = _find(item.classification, function (o) {
        return o.stewardOrg && o.stewardOrg.name === orgName;
    });
    if (classification) {
        let leaf = findLeaf(classification, categories);
        if (leaf) {
            leaf.parent.elements.splice(leaf.index, 1);
            item.updated = new Date();
            if (item.markModified) item.markModified('classification');
        }
    }
};

export function renameClassifyElt(item, orgName, categories, newName) {
    let classification = _find(item.classification, function (o) {
        return o.stewardOrg && o.stewardOrg.name === orgName;
    });
    if (classification) {
        let leaf = findLeaf(classification, categories);
        if (leaf) {
            leaf.leaf.name = newName;
            item.updated = new Date();
            arrangeClassification(item, orgName);
            if (item.markModified) item.markModified('classification');
        }
    }
}

// PUT NEW API ABOVE

export function findSteward(de, orgName) {
    if (!de) return null;
    for (let i = 0; i < de.classification.length; i++) {
        if (de.classification[i].stewardOrg.name === orgName) {
            return {index: i, object: de.classification[i]};
        }
    }
}

export function deleteCategory(tree, fields) {
    let lastLevel = fetchLevel(tree, fields);
    for (let i = 0; i < lastLevel.elements.length; i++) {
        if (lastLevel.elements[i] === null) {
            lastLevel.elements.splice(i, 1);
            i = i - 1;
        }
        if (lastLevel.elements[i].name === fields[fields.length - 1]) {
            lastLevel.elements.splice(i, 1);
            break;
        }
    }
}

export function renameCategory(tree, fields, newName) {
    let lastLevel = fetchLevel(tree, fields);
    for (let i = 0; i < lastLevel.elements.length; i++) {
        if (lastLevel.elements[i] === null) {
            lastLevel.elements.splice(i, 1);
            i = i - 1;
        }
        if (lastLevel.elements[i].name === fields[fields.length - 1]) {
            lastLevel.elements[i].name = newName;
            break;
        }
    }
}

export function modifyCategory(tree, fields, action, cb) {
    let lastLevel = fetchLevel(tree, fields);
    for (let i = 0; i < lastLevel.elements.length; i++) {
        if (lastLevel.elements[i] === null) {
            lastLevel.elements.splice(i, 1);
            i = i - 1;
        }
        if (lastLevel.elements[i].name === fields[fields.length - 1]) {
            if (action.type === actions.delete)
                lastLevel.elements.splice(i, 1);
            if (action.type === actions.rename)
                lastLevel.elements[i].name = action.newname;
            break;
        }
    }
    if (cb) {
        cb();
    }
}

export function removeCategory(tree, fields, cb) {
    let lastLevel = fetchLevel(tree, fields);
    for (let i = 0; i < lastLevel.elements.length; i++) {
        if (lastLevel.elements[i] === null) {
            lastLevel.elements.splice(i, 1);
            i = i - 1;
        }
        if (lastLevel.elements[i].name === fields[fields.length - 1]) {
            lastLevel.elements.splice(i, 1);
            return cb();
        }
    }
    return cb('Did not find match classifications.');
}

export function classifyItem(item, orgName, classifPath) {
    let steward = findSteward(item, orgName);
    if (!steward) {
        item.classification.push({
            stewardOrg: {
                name: orgName
            },
            elements: []
        });
        steward = findSteward(item, orgName);
    }
    for (let i = 1; i <= classifPath.length; i++) {
        addCategory(steward.object, classifPath.slice(0, i));
    }
}

export function addCategory(tree, fields, cb) {
    let lastLevel = fetchLevel(tree, fields);
    if (isDuplicate(lastLevel.elements, fields[fields.length - 1])) {
        if (cb) return cb('Classification Already Exists');
    } else {
        lastLevel.elements.push({name: fields[fields.length - 1], elements: []});
        if (cb) return cb();
    }
}

export function fetchLevel(tree, fields) {
    let tempTree = tree;
    function findCategory(subTree, name) {
        for (let i = 0; i < subTree.elements.length; i++) {
            if (subTree.elements[i].name === name) {
                if (!subTree.elements[i].elements) subTree.elements[i].elements = [];
                return subTree.elements[i];
            }
        }
        subTree.elements.push({name: name, elements: []});
        return subTree.elements[subTree.elements.length - 1];
    }
    for (let j = 0; j < fields.length - 1; j++) {
        if (tempTree) {
            tempTree = findCategory(tempTree, fields[j]);
        }
    }
    return tempTree;
}

export function treeChildren(tree, path, cb) {
    tree.elements.forEach(function (element) {
        let newpath = path.slice(0);
        newpath.push(element.name);
        if (element.elements && element.elements.length > 0) {
            treeChildren(element, newpath, cb);
        } else {
            cb(newpath);
        }
    });
}

export function transferClassifications(source, destination) {
    source.classification.forEach(function (stewardOrgSource) {
        let st = findSteward(destination, stewardOrgSource.stewardOrg.name);
        let stewardOrgDestination;
        if (st) {
            stewardOrgDestination = st.object;
        } else {
            destination.classification.push({stewardOrg: {name: stewardOrgSource.stewardOrg.name}, elements: []});
            stewardOrgDestination = destination.classification[destination.classification.length - 1];
        }
        stewardOrgDestination.name = stewardOrgDestination.stewardOrg.name;
        treeChildren(stewardOrgSource, [], function (path) {
            addCategory(stewardOrgDestination, path, function () {
            });
        });
    });
}

/**
 * Delete data element classification given an organization name.
 *
 * @param {type} elt - data element or form
 * @param {type} orgName - organization name
 * @returns none
 */
export function removeClassification(elt, orgName) {
    for (let i = 0; i < elt.classification.length; i++) {
        if (elt.classification[i].stewardOrg.name === orgName) {
            elt.classification.splice(i, 1);
            break;
        }
    }
}

/**
 * Traverse array for duplicates.
 * @param {type} elements - Array of elements to traverse.
 * @param {type} name - Name of duplicate.
 * @returns {Boolean} - True if duplicate found, false otherwise.
 */
export function isDuplicate(elements, name) {
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].name === name) {
            return true;
        }
    }
    return false;
}


export function sortClassification(elt) {
    elt.classification = elt.classification.sort(function (c1, c2) {
        return c1.stewardOrg.name.localeCompare(c2.stewardOrg.name);
    });
    let sortSubClassif = function (classif) {
        if (classif.elements) {
            classif.elements = classif.elements.sort(function (c1, c2) {
                return c1.name.localeCompare(c2.name);
            });
        }
    };
    let doRecurse = function (classif) {
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
}
