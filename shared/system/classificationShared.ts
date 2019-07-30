import { find, slice, uniqWith } from 'lodash';
import { Cb, Cb1, Classification, ClassificationElement, Item, MongooseType, Organization } from 'shared/models.model';

export const actions: {
    create: string,
    delete: string,
    rename: string
} = {
    create: 'create',
    delete: 'delete',
    rename: 'rename'
};

function findClassifOrCreate(elements: ClassificationElement[], category: string): ClassificationElement {
    let found = find(elements, (element: ClassificationElement) => element.name === category);
    if (!found) {
        found = {name: category, elements: []};
        elements.push(found);
    }
    return found;
}

export function addCategoriesToOrg(org: Organization, categories: string[]): void {
    if (!org.classifications) org.classifications = [];
    addCategoriesToTree(findClassifOrCreate(org.classifications, categories[0]), slice(categories, 1));
}

export function addCategoriesToTree(tree: Classification | ClassificationElement, categories: string[]): void {
    let p = tree;
    categories.forEach(category => {
        if (!p.elements) p.elements = [];
        p = findClassifOrCreate(p.elements, category);
    });
}

export function arrangeClassification(item: Item, orgName: string): void {
    let index = item.classification!.findIndex(o => o.stewardOrg.name === orgName);
    item.classification!.unshift(item.classification!.splice(index, 1)[0]);
}

export function classifyItem(item: MongooseType<Item>, orgName: string, categories: string[]): void {
    if (!item.classification) item.classification = [];
    let classification = find(item.classification, (o: Classification) => o.stewardOrg && o.stewardOrg.name === orgName);
    if (!classification) {
        classification = {
            stewardOrg: {name: orgName},
            elements: []
        };
        item.classification.push(classification);
    }
    addCategoriesToTree(classification, categories);
    arrangeClassification(item, orgName);
    if (item.markModified) item.markModified('classification');
}

export function findLeaf(classification: Classification, categories: string[]): any {
    let notExist = false;
    let leaf: Classification | ClassificationElement | undefined = classification;
    let parent: Classification | ClassificationElement | undefined = classification;
    let index = null;
    categories.forEach((category, i) => {
        index = i;
        let found = find(leaf!.elements, (element: ClassificationElement) => element.name === category);
        if (i === categories.length - 2) parent = found;
        if (!found) notExist = true;
        leaf = found;
    });
    if (notExist) {
        return null;
    } else {
        return {
            leaf: leaf,
            parent: parent
        };
    }
}

export function renameClassifyElt(item: MongooseType<Item>, orgName: string, categories: string[], newName: string): void {
    if (!item.classification) item.classification = [];
    let classification = find(item.classification, (o: Classification) => o.stewardOrg && o.stewardOrg.name === orgName);
    if (classification) {
        let leaf = findLeaf(classification, categories);
        if (leaf) {
            leaf.leaf.name = newName;
            arrangeClassification(item, orgName);
            if (item.markModified) item.markModified('classification');
        }
    }
}

export function unclassifyElt(item: MongooseType<Item>, orgName: string, categories: string[]): any {
    let classification = find(item.classification, (o: Classification) => o.stewardOrg && o.stewardOrg.name === orgName);
    if (classification) {
        let leaf = findLeaf(classification, categories);
        if (leaf) {
            leaf.parent.elements.splice(leaf.index, 1);
            if (item.markModified) item.markModified('classification');
        }
    }
}

// PUT NEW API ABOVE
// ---------------------------------------------------
export function addCategory(tree: Classification, fields: string[], cb: Cb<string> = () => {
}): void {
    let lastLevel = fetchLevel(tree, fields);
    if (lastLevel.elements.some(element => element.name === fields[fields.length - 1])) {
        return cb('Classification Already Exists');
    } else {
        lastLevel.elements.push({name: fields[fields.length - 1], elements: []});
        return cb();
    }
}

export function deleteCategory(tree: Classification, fields: string[]): void {
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

export function fetchLevel(tree: Classification, fields: string[]): Classification | ClassificationElement {
    function findCategory(subTree: Classification | ClassificationElement, name: string) {
        for (let i = 0; i < subTree.elements.length; i++) {
            if (subTree.elements[i].name === name) {
                if (!subTree.elements[i].elements) subTree.elements[i].elements = [];
                return subTree.elements[i];
            }
        }
        subTree.elements.push({name: name, elements: []});
        return subTree.elements[subTree.elements.length - 1];
    }

    let tempTree: Classification | ClassificationElement = tree;
    for (let j = 0; j < fields.length - 1; j++) {
        if (tempTree) {
            tempTree = findCategory(tempTree, fields[j]);
        }
    }
    return tempTree;
}

export function findSteward(de: Item, orgName: string): { index: number, object: Classification } | undefined {
    if (!de || !de.classification) return undefined;
    for (let i = 0; i < de.classification.length; i++) {
        if (de.classification[i].stewardOrg.name === orgName) {
            return {index: i, object: de.classification[i]};
        }
    }
}

export function modifyCategory(tree: Classification, fields: string[], action: any, cb: Cb): void {
    let lastLevel = fetchLevel(tree, fields);
    for (let i = 0; i < lastLevel.elements.length; i++) {
        if (lastLevel.elements[i] === null) {
            lastLevel.elements.splice(i, 1);
            i = i - 1;
        }
        if (lastLevel.elements[i].name === fields[fields.length - 1]) {
            if (action.type === actions.delete) {
                lastLevel.elements.splice(i, 1);
            }
            if (action.type === actions.rename) {
                lastLevel.elements[i].name = action.newname;
            }
            break;
        }
    }
    cb();
}

export function removeCategory(tree: Classification, fields: string[], cb: Cb<string>): void {
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

export function renameCategory(tree: Classification, fields: string[], newName: string): void {
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

export function sortClassification(item: Item): Item {
    function sortElements(elements: ClassificationElement[]) {
        elements.sort((c1, c2) => c1.name.localeCompare(c2.name));
        elements.forEach(e => sortElements(e.elements));
    }

    item.classification!.sort((c1, c2) => c1.stewardOrg.name.localeCompare(c2.stewardOrg.name));
    item.classification!.forEach(c => sortElements(c.elements));
    return item;
}

export function transferClassifications(source: Item, destination: Item): void {
    if (!destination.classification) destination.classification = [];
    source.classification!.forEach(stewardOrgSource => {
        let st = findSteward(destination, stewardOrgSource.stewardOrg.name);
        let stewardOrgDestination: Classification;
        if (st) {
            stewardOrgDestination = st.object;
        } else {
            destination.classification!.push({stewardOrg: {name: stewardOrgSource.stewardOrg.name}, elements: []});
            stewardOrgDestination = destination.classification![destination.classification!.length - 1];
        }
        treeChildren(stewardOrgSource, [], path => {
            addCategory(stewardOrgDestination, path);
        });
    });
}

type Element = {
    name: string,
    elements: Element[]
}
type OrgClassification = {
    _id: String,
    elements: Element []
}

function mergeElements(e1: Element[], e2: Element[]): Element [] {
    return uniqWith(e1.concat(e2), (arrVal: Element, othVal: Element) => {
        if (arrVal.name === othVal.name) {
            othVal.elements = mergeElements(arrVal.elements, othVal.elements);
            return true;
        } else return false;
    });
}

export function mergeOrgClassifications(c1: OrgClassification[], c2: OrgClassification[]): OrgClassification[] {
    return uniqWith(c1.concat(c2), (arrVal: OrgClassification, othVal: OrgClassification) => {
        if (arrVal._id === othVal._id) {
            othVal.elements = mergeElements(arrVal.elements, othVal.elements);
            return true;
        } else return false;
    });
}

function treeChildren(tree: Classification | ClassificationElement, path: string[], cb: Cb1<string[]>) {
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
