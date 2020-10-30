import { ClassificationElement, Item } from 'shared/models.model';
import { addCategory, findSteward } from 'shared/system/classificationShared';
import { isEqual, union, unionWith } from 'lodash';

export function classifyItem(item: Item, orgName: string, classifPath: string[]): void {
    let steward = findSteward(item, orgName);
    if (!steward) {
        if (!item.classification) {
            item.classification = [];
        }
        const newClassification = {
            stewardOrg: {
                name: orgName
            },
            elements: []
        };
        item.classification.push(newClassification);
        steward = {index: item.classification.length - 1, object: newClassification};
    }
    for (let i = 1; i <= classifPath.length; i++) {
        addCategory(steward.object, classifPath.slice(0, i));
    }
}

export function flattenClassification(elt: Item): string[] {
    function doClassif(currentString: string, classif: ClassificationElement, result: string[]) {
        if (currentString.length > 0) {
            currentString = currentString + ' | ';
        }
        currentString = currentString + classif.name;
        if (classif.elements && classif.elements.length > 0) {
            classif.elements.forEach((cl: ClassificationElement) => {
                doClassif(currentString, cl, result);
            });
        } else {
            result.push(currentString);
        }
    }

    const result: string[] = [];
    if (elt.classification) {
        elt.classification.forEach(cl => {
            if (cl.elements) {
                cl.elements.forEach(subCl => doClassif(cl.stewardOrg.name, subCl, result));
            }
        });
    }
    return result;
}

function mergeDesignations(a: any, b: any) {
    if (isEqual(a.designation, b.designation)) {
        b.tags = union(a.tags, b.tags);
        return true;
    } else {
        return false;
    }
}

function mergeDefinitions(a: any, b: any) {
    if (isEqual(a.definition, b.definition)) {
        b.tags = union(a.tags, b.tags);
        return true;
    } else {
        return false;
    }
}

function mergeReferenceDocuments(a: any, b: any) {
    return isEqual(a.document, b.document)
        && isEqual(a.title, b.title)
        && isEqual(a.uri, b.uri)
        && isEqual(a.providerOrg, b.providerOrg)
        && isEqual(a.docType, b.docType);
}

function mergeProperties(a: any, b: any) {
    return isEqual(a.key, b.key)
        && isEqual(a.value, b.value)
        && isEqual(a.source, b.source);
}

function mergeIds(a: any, b: any) {
    return isEqual(a.id, b.id)
        && isEqual(a.source, b.source);
}

function mergeAttachments(a: any, b: any) {
    return isEqual(a.fileid, b.fileid)
        && isEqual(a.source, b.source);
}

function mergeDataSets(a: any, b: any) {
    return isEqual(a.id, b.id)
        && isEqual(a.notes, b.notes)
        && isEqual(a.source, b.source)
        && isEqual(a.studyUri, b.studyUri);
}

function mergeDerivationRules(a: any, b: any) {
    return isEqual(a.ruleType, b.ruleType)
        && isEqual(a.formula, b.formula)
        && isEqual(a.name, b.name)
        && isEqual(a.inputs, b.inputs)
        && isEqual(a.outputs, b.outputs);
}

function mergeSources(a: any, b: any) {
    return isEqual(a.sourceName, b.sourceName);
}

export function mergeArrayByDesignations(eltFrom: any, eltTo: any) {
    eltTo.designations = unionWith(eltTo.designations, eltFrom.designations, mergeDesignations);
}

export function mergeArrayByDefinitions(eltFrom: any, eltTo: any) {
    eltTo.definitions = unionWith(eltTo.definitions, eltFrom.definitions, mergeDefinitions);
}

export function mergeArrayByReferenceDocuments(eltFrom: any, eltTo: any) {
    eltTo.referenceDocuments = unionWith(eltTo.referenceDocuments, eltFrom.referenceDocuments, mergeReferenceDocuments);
}

export function mergeArrayByProperties(eltFrom: any, eltTo: any) {
    eltTo.properties = unionWith(eltTo.properties, eltFrom.properties, mergeProperties);
}

export function mergeArrayByIds(eltFrom: any, eltTo: any) {
    eltTo.ids = unionWith(eltTo.ids, eltFrom.ids, mergeIds);
}

export function mergeArrayByAttachments(eltFrom: any, eltTo: any) {
    eltTo.attachments = unionWith(eltTo.attachments, eltFrom.attachments, mergeAttachments);
}

export function mergeArrayByDataSets(eltFrom: any, eltTo: any) {
    eltTo.dataSets = unionWith(eltTo.dataSets, eltFrom.dataSets, mergeDataSets);
}

export function mergeArrayByDerivationRules(eltFrom: any, eltTo: any) {
    eltTo.derivationRules = unionWith(eltTo.derivationRules, eltFrom.derivationRules, mergeDerivationRules);
}

export function mergeArrayBySources(eltFrom: any, eltTo: any) {
    eltTo.sources = unionWith(eltTo.sources, eltFrom.sources, mergeSources);
}
