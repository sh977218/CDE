import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';
import _noop from 'lodash/noop';
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
}

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
// ---------------------------------------------------
export function addCategory(tree, fields, cb = _noop) {
    let lastLevel = fetchLevel(tree, fields);
    if (isDuplicate(lastLevel.elements, fields[fields.length - 1])) {
        return cb('Classification Already Exists');
    } else {
        lastLevel.elements.push({name: fields[fields.length - 1], elements: []});
        return cb();
    }
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

export function fetchLevel(tree, fields) {
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

    let tempTree = tree;
    for (let j = 0; j < fields.length - 1; j++) {
        if (tempTree) {
            tempTree = findCategory(tempTree, fields[j]);
        }
    }
    return tempTree;
}


export function findSteward(de, orgName) {
    if (!de) return null;
    for (let i = 0; i < de.classification.length; i++) {
        if (de.classification[i].stewardOrg.name === orgName) {
            return {index: i, object: de.classification[i]};
        }
    }
}

export function flattenClassification(elt) {
    function doClassif(currentString, classif, result) {
        if (currentString.length > 0) {
            currentString = currentString + ' | ';
        }
        currentString = currentString + classif.name;
        if (classif.elements && classif.elements.length > 0) {
            classif.elements.forEach((cl) => {
                doClassif(currentString, cl, result);
            });
        } else {
            result.push(currentString);
        }
    }

    let result = [];
    if (elt.classification) {
        elt.classification.forEach(cl => {
            if (cl.elements) {
                cl.elements.forEach(subCl => doClassif(cl.stewardOrg.name, subCl, result));
            }
        });
    }
    return result;
}

export function isDuplicate(elements, name) {
    return elements.some(element => element.name === name);
}

export function mergeArrayByProperty(arrayFrom, arrayTo, property) {
    arrayFrom[property].forEach((objFrom) => {
        let exist = arrayTo[property].filter((objTo) => JSON.stringify(objTo) === JSON.stringify(objFrom)).length > 0;
        if (!exist) arrayTo[property].push(objFrom);
    });
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
    cb();
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

export function removeClassification(elt, orgName) {
    for (let i = 0; i < elt.classification.length; i++) {
        if (elt.classification[i].stewardOrg.name === orgName) {
            elt.classification.splice(i, 1);
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

export function sortClassification(item) {
    function sortElements(elements) {
        elements.sort((c1, c2) => c1.name.localeCompare(c2.name));
        elements.forEach(e => sortElements(e.elements));
    }

    item.classification.sort((c1, c2) => c1.stewardOrg.name.localeCompare(c2.stewardOrg.name));
    item.classification.forEach(c => sortElements(c.elements));
    return item;
}

export function treeChildren(tree, path, cb) {
    tree.elements.forEach(function (element) {
        let newPath = path.slice(0);
        newPath.push(element.name);
        if (element.elements && element.elements.length > 0) {
            treeChildren(element, newPath, cb);
        } else {
            cb(newPath);
        }
    });
}
