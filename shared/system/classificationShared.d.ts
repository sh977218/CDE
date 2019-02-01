import { Cb, Classification, Item, Organization } from 'shared/models.model';

declare const actions: {
    create: string,
    delete: string,
    rename: string
};

declare function addCategoriesToOrg(org: Organization, categories: string[]): void;
declare function addCategoriesToTree(tree: Classification, categories: string[]): void;
declare function arrangeClassification(item: Item, orgName: string): void;
declare function classifyElt(item: Item, orgName: string, categories: string[]): void;
declare function findLeaf(classification: Classification, categories: string[]): any;
declare function renameClassifyElt(item: Item, orgName: string, categories: string[], newName: string): void;
declare function unclassifyElt(item: Item, orgName: string, categories: string[]): any;

// old
declare function addCategory(tree: Classification, fields: string[], cb?: Cb<string>): void;
declare function classifyItem(item: Item, orgName: string, classifPath: string[]): void;
declare function deleteCategory(tree: Classification, fields: string[]): void;
declare function fetchLevel(tree: Classification, fields: string[]): Classification;
declare function findSteward(de: Item, orgName: string): {index: number, object: Classification}|null;
declare function flattenClassification(item: Item): string[];
declare function isDuplicate(elements: any, name: string): boolean;
declare function mergeArrayByProperty(arrayFrom: any, arrayTo: any, property: string): void;
declare function modifyCategory(tree: Classification, fields: string[], action: any, cb: Cb): void;
declare function removeCategory(tree: Classification, fields: string[], cb:  Cb<string>): void;
declare function removeClassification(elt: Item, orgName: string): void;
declare function renameCategory(tree: Classification, fields: string[], newName: string): void;
declare function sortClassification(elt: Item): Item;
declare function transferClassifications(source: Item, destination: Item): void;
declare function treeChildren(tree: Classification, path: string, cb: Cb<string>): void;
