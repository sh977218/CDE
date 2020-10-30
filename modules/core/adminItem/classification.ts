import { unionWith } from 'lodash';
import { ClassificationElement, Item } from 'shared/models.model';
import { addCategory, findSteward } from 'shared/system/classificationShared';
import {
    attachmentComparator, dataSetComparator, definitionComparator, derivationRuleComparator, designationComparator,
    idComparator, propertyComparator, referenceDocumentComparator, sourceComparator
} from 'shared/system/util';

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

export function mergeArrayByDesignations(eltFrom: any, eltTo: any) {
    eltTo.designations = unionWith(eltTo.designations, eltFrom.designations, designationComparator);
}

export function mergeArrayByDefinitions(eltFrom: any, eltTo: any) {
    eltTo.definitions = unionWith(eltTo.definitions, eltFrom.definitions, definitionComparator);
}

export function mergeArrayByReferenceDocuments(eltFrom: any, eltTo: any) {
    eltTo.referenceDocuments = unionWith(eltTo.referenceDocuments, eltFrom.referenceDocuments, referenceDocumentComparator);
}

export function mergeArrayByProperties(eltFrom: any, eltTo: any) {
    eltTo.properties = unionWith(eltTo.properties, eltFrom.properties, propertyComparator);
}

export function mergeArrayByIds(eltFrom: any, eltTo: any) {
    eltTo.ids = unionWith(eltTo.ids, eltFrom.ids, idComparator);
}

export function mergeArrayByAttachments(eltFrom: any, eltTo: any) {
    eltTo.attachments = unionWith(eltTo.attachments, eltFrom.attachments, attachmentComparator);
}

export function mergeArrayByDataSets(eltFrom: any, eltTo: any) {
    eltTo.dataSets = unionWith(eltTo.dataSets, eltFrom.dataSets, dataSetComparator);
}

export function mergeArrayByDerivationRules(eltFrom: any, eltTo: any) {
    eltTo.derivationRules = unionWith(eltTo.derivationRules, eltFrom.derivationRules, derivationRuleComparator);
}

export function mergeArrayBySources(eltFrom: any, eltTo: any) {
    eltTo.sources = unionWith(eltTo.sources, eltFrom.sources, sourceComparator);
}
