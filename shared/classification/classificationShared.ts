import { find, slice, sortBy, uniqWith } from 'lodash';
import { Item } from 'shared/item';
import {
    Cb1,
    Classification,
    ClassificationElement,
    ClassificationElementsContainer,
    ObjectId,
} from 'shared/models.model';
import { Organization } from 'shared/organization/organization';

export const actions: {
    create: string;
    delete: string;
    rename: string;
} = {
    create: 'create',
    delete: 'delete',
    rename: 'rename',
};

function findClassifOrCreate(elements: ClassificationElement[], category: string): ClassificationElement {
    let found = find(elements, (element: ClassificationElement) => element.name === category);
    if (!found) {
        found = { name: category, elements: [] };
        elements.push(found);
    }
    return found;
}

export function addCategoriesToOrg(org: Organization, categories: string[]): void {
    if (!org.classifications) {
        org.classifications = [];
    }
    addCategoriesToTree(findClassifOrCreate(org.classifications, categories[0]), slice(categories, 1));
}

export function addCategoriesToTree(tree: ClassificationElementsContainer, categories: string[]): void {
    let p = tree;
    categories.forEach(category => {
        if (!p.elements) {
            p.elements = [];
        }
        p = findClassifOrCreate(p.elements, category);
    });
}

export function arrangeClassification(item: Item, orgName: string): void {
    if (item.classification) {
        item.classification.unshift(
            item.classification.splice(
                item.classification.findIndex(o => o.stewardOrg.name === orgName),
                1
            )[0]
        );
    }
}

export function findLeaf(classification: Classification, categories: string[]): any {
    let notExist = false;
    let leaf: ClassificationElementsContainer | undefined = classification;
    let parent: ClassificationElementsContainer | undefined = classification;
    categories.forEach((category, i) => {
        const found = find(
            (leaf && leaf.elements) || [],
            (element: ClassificationElement) => element.name === category
        );
        if (i === categories.length - 2) {
            parent = found;
        }
        if (!found) {
            notExist = true;
        }
        leaf = found;
    });
    if (notExist) {
        return null;
    } else {
        return {
            leaf,
            parent,
        };
    }
}

// PUT NEW API ABOVE
// ---------------------------------------------------
export function addCategory(tree: Classification, fields: string[]): string | undefined {
    const lastLevel = fetchLevel(tree, fields);
    if (lastLevel.elements.some(element => element.name === fields[fields.length - 1])) {
        return 'Classification Already Exists';
    } else {
        lastLevel.elements.push({ name: fields[fields.length - 1], elements: [] });
    }
}

export function deleteCategory(tree: Classification, fields: string[]): void {
    const lastLevel = fetchLevel(tree, fields);
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

export function fetchLevel(tree: Classification, fields: string[]): ClassificationElementsContainer {
    function findCategory(subTree: ClassificationElementsContainer, name: string) {
        for (const element of subTree.elements) {
            if (element.name === name) {
                if (!element.elements) {
                    element.elements = [];
                }
                return element;
            }
        }
        subTree.elements.push({ name, elements: [] });
        return subTree.elements[subTree.elements.length - 1];
    }

    let tempTree: ClassificationElementsContainer = tree;
    for (let j = 0; j < fields.length - 1; j++) {
        if (tempTree) {
            tempTree = findCategory(tempTree, fields[j]);
        }
    }
    return tempTree;
}

export function findSteward(item: Item, orgName: string): { index: number; object: Classification } | undefined {
    if (!item || !item.classification) {
        return;
    }
    for (let i = 0; i < item.classification.length; i++) {
        if (item.classification[i].stewardOrg.name === orgName) {
            return { index: i, object: item.classification[i] };
        }
    }
}

export function modifyCategory(tree: Classification, fields: string[], action: any): void {
    const lastLevel = fetchLevel(tree, fields);
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
}

export function removeCategory(tree: Classification, fields: string[]): string | undefined {
    const lastLevel = fetchLevel(tree, fields);
    for (let i = 0; i < lastLevel.elements.length; i++) {
        if (lastLevel.elements[i] === null) {
            lastLevel.elements.splice(i, 1);
            i = i - 1;
        }
        if (lastLevel.elements[i].name === fields[fields.length - 1]) {
            lastLevel.elements.splice(i, 1);
            return;
        }
    }
    return 'Did not find match classifications.';
}

export function renameCategory(tree: Classification, fields: string[], newName: string): void {
    const lastLevel = fetchLevel(tree, fields);
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
    function sortElements(elements: ClassificationElement[] = []) {
        elements.sort((c1, c2) => c1.name.localeCompare(c2.name));
        elements.forEach(e => sortElements(e.elements));
    }

    if (item.classification) {
        item.classification.sort((c1, c2) => c1.stewardOrg.name.localeCompare(c2.stewardOrg.name));
        item.classification.forEach(c => sortElements(c.elements));
    }
    return item;
}

export function transferClassifications(source: Item, destination: Item): void {
    if (source.classification) {
        if (!destination.classification) {
            destination.classification = [];
        }
        const destinationClassification = destination.classification;
        source.classification.forEach(stewardOrgSource => {
            const st = findSteward(destination, stewardOrgSource.stewardOrg.name);
            let stewardOrgDestination: Classification;
            if (st) {
                stewardOrgDestination = st.object;
            } else {
                destinationClassification.push({
                    stewardOrg: { name: stewardOrgSource.stewardOrg.name },
                    elements: [],
                });
                stewardOrgDestination = destinationClassification[destinationClassification.length - 1];
            }
            treeChildren(stewardOrgSource, [], path => {
                addCategory(stewardOrgDestination, path);
            });
        });
    }
}

interface Element {
    name: string;
    elements: Element[];
}

export interface OrgClassification {
    stewardOrg: {
        name: string;
    };
    elements: Element[];
}

export interface OrgClassificationAggregate {
    _id: {
        name: ObjectId;
        elements: Element[];
    };
}

function mergeElements(e1: Element[] = [], e2: Element[] = []): Element[] {
    const duplicatedElements: Element[] = e1.concat(e2);
    const uniqElements = uniqWith(duplicatedElements, (arrVal: Element, othVal: Element) => {
        if (arrVal.name === othVal.name) {
            othVal.elements = mergeElements(arrVal.elements, othVal.elements);
            return true;
        } else {
            return false;
        }
    });
    const sortElements = sortBy(uniqElements, 'name');
    return sortElements;
}

export function mergeOrgClassificationAggregate(
    c1: OrgClassificationAggregate[] = [],
    c2: OrgClassificationAggregate[] = []
) {
    const e1: Element[] = [];
    const e2: Element[] = [];
    c1.forEach(c => {
        c._id.elements.forEach(e =>
            e1.push({
                name: e.name,
                elements: e.elements,
            })
        );
    });
    c2.forEach(c => {
        c._id.elements.forEach(e =>
            e2.push({
                name: e.name,
                elements: e.elements,
            })
        );
    });
    return mergeElements(e1, e2);
}

function treeChildren(tree: ClassificationElementsContainer, path: string[], cb: Cb1<string[]>) {
    tree.elements.forEach(element => {
        const newPath = path.slice(0);
        newPath.push(element.name);
        if (element.elements && element.elements.length > 0) {
            treeChildren(element, newPath, cb);
        } else {
            cb(newPath);
        }
    });
}
