import { ClassificationElement, Item } from 'shared/models.model';
import { addCategory, findSteward } from 'shared/system/classificationShared';

export function classifyItem(item: Item, orgName: string, classifPath: string[]): void {
    let steward = findSteward(item, orgName);
    if (!steward) {
        if (!item.classification) { item.classification = []; }
        item.classification.push({
            stewardOrg: {
                name: orgName
            },
            elements: []
        });
        steward = findSteward(item, orgName);
    }
    for (let i = 1; i <= classifPath.length; i++) {
        addCategory(steward!.object, classifPath.slice(0, i));
    }
}

export function flattenClassification(elt: Item): string[] {
    function doClassif(currentString: string, classif: ClassificationElement, result: string[]) {
        if (currentString.length > 0) {
            currentString = currentString + ' | ';
        }
        currentString = currentString + classif.name;
        if (classif.elements && classif.elements.length > 0) {
            classif.elements.forEach(cl => doClassif(currentString, cl, result));
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

export function mergeArrayByProperty(arrayFrom: any, arrayTo: any, property: string): void {
    arrayFrom[property].forEach((objFrom: any) => {
        const exist = arrayTo[property].filter((objTo: any) => JSON.stringify(objTo) === JSON.stringify(objFrom)).length > 0;
        if (!exist) { arrayTo[property].push(objFrom); }
    });
}
