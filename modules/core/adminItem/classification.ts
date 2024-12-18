import { unionWith } from 'lodash';
import { addCategory, findSteward } from 'shared/classification/classificationShared';
import { Item } from 'shared/item';
import { ClassificationElement, Elt } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import {
    attachmentComparator,
    dataSetComparator,
    definitionComparator,
    derivationRuleComparator,
    designationComparator,
    idComparator,
    propertyComparator,
    referenceDocumentComparator,
    sourceComparator,
} from 'shared/elt/comparator';

export function classifyItem(item: Item, orgName: string, classifPath: string[]): void {
    let steward = findSteward(item, orgName);
    if (!steward) {
        if (!item.classification) {
            item.classification = [];
        }
        const newClassification = {
            stewardOrg: {
                name: orgName,
            },
            elements: [],
        };
        item.classification.push(newClassification);
        steward = { index: item.classification.length - 1, object: newClassification };
    }
    for (let i = 1; i <= classifPath.length; i++) {
        addCategory(steward.object, classifPath.slice(0, i));
    }
}

export function flattenClassification(elt: Elt): string[] {
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

export function mergeArrayByDesignations(eltFrom: Elt, eltTo: Elt) {
    eltTo.designations = unionWith(eltTo.designations, eltFrom.designations, designationComparator);
}

export function mergeArrayByDefinitions(eltFrom: Elt, eltTo: Elt) {
    eltTo.definitions = unionWith(eltTo.definitions, eltFrom.definitions, definitionComparator);
}

export function mergeArrayByReferenceDocuments(eltFrom: Elt, eltTo: Elt) {
    eltTo.referenceDocuments = unionWith(
        eltTo.referenceDocuments,
        eltFrom.referenceDocuments,
        referenceDocumentComparator
    );
}

export function mergeArrayByProperties(eltFrom: Elt, eltTo: Elt) {
    eltTo.properties = unionWith(eltTo.properties, eltFrom.properties, propertyComparator);
}

export function mergeArrayByIds(eltFrom: Elt, eltTo: Elt) {
    eltTo.ids = unionWith(eltTo.ids, eltFrom.ids, idComparator);
}

export function mergeArrayByAttachments(eltFrom: Elt, eltTo: Elt) {
    eltTo.attachments = unionWith(eltTo.attachments, eltFrom.attachments, attachmentComparator);
}

export function mergeArrayByDataSets(eltFrom: DataElement, eltTo: DataElement) {
    eltTo.dataSets = unionWith(eltTo.dataSets, eltFrom.dataSets, dataSetComparator);
}

export function mergeArrayByDerivationRules(eltFrom: DataElement, eltTo: DataElement) {
    eltTo.derivationRules = unionWith(eltTo.derivationRules, eltFrom.derivationRules, derivationRuleComparator);
}

export function mergeArrayBySources(eltFrom: Elt, eltTo: Elt) {
    eltTo.sources = unionWith(eltTo.sources, eltFrom.sources, sourceComparator);
}
