import { Classification, Organization } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';

declare const actions: {
    create: string,
    delete: string,
    rename: string
};

type Item = DataElement|CdeForm;
type Cb = (message: string) => void;

declare function addCategoriesToOrg(org: Organization, categories: string[]): void;
declare function addCategoriesToTree(tree: Classification, categories: string[]): void;
declare function arrangeClassification(item: Item, orgName: string): void;
declare function classifyElt(item: Item, orgName: string, categories: string[]): void;
declare function findLeaf(classification: Classification, categories: string[]): any;
declare function renameClassifyElt(item: Item, orgName: string, categories: string[], newName: string): void;
declare function unclassifyElt(item: Item, orgName: string, categories: string[]): any;

// old
declare function addCategory(tree: Classification, fields: string[], cb: Cb): void;
declare function classifyItem(item: Item, orgName: string, classifPath: string[]): void;
declare function deleteCategory(tree: Classification, fields: string[]): void;
declare function fetchLevel(tree: Classification, fields: string[]): Classification;
declare function findSteward(de: Item, orgName: string): {index: number, object: Classification};
declare function isDuplicate(elements: any, name: string): boolean;
declare function modifyCategory(tree: Classification, fields: string[], action: any, cb: () => void): void;
declare function removeCategory(tree: Classification, fields: string[], cb:  Cb): void;
declare function removeClassification(elt: Item, orgName: string): void;
declare function renameCategory(tree: Classification, fields: string[], newName: string): void;
declare function sortClassification(elt: Item): void;
declare function transferClassifications(source: Item, destination: Item): void;
declare function treeChildren(tree: Classification, path: string, cb: Cb): void;
