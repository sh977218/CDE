import { addCategory, findSteward } from 'shared/system/classificationShared';

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

export function mergeArrayByProperty(arrayFrom, arrayTo, property) {
    arrayFrom[property].forEach((objFrom) => {
        let exist = arrayTo[property].filter((objTo) => JSON.stringify(objTo) === JSON.stringify(objFrom)).length > 0;
        if (!exist) arrayTo[property].push(objFrom);
    });
}
