import { Injectable } from "@angular/core";

@Injectable()
export class ClassificationService {
    sortClassification(elt) {
        elt.classification = elt.classification.sort(function (c1, c2) {
            return c1.stewardOrg.name.localeCompare(c2.stewardOrg.name);
        });
        let sortSubClassif = function (classif) {
            if (classif.elements) {
                classif.elements = classif.elements.sort(function (c1, c2) {
                    return c1.name.localeCompare(c2.name);
                });
            }
        };
        let doRecurse = function (classif) {
            sortSubClassif(classif);
            if (classif.elements) {
                classif.elements.forEach(function (subElt) {
                    doRecurse(subElt);
                });
            }
        };
        elt.classification.forEach(function (classif) {
            doRecurse(classif);
        });
    }

    doClassif(currentString, classif, result) {
        if (currentString.length > 0) {
            currentString = currentString + " | ";
        }
        currentString = currentString + classif.name;
        if (classif.elements && classif.elements.length > 0) {
            classif.elements.forEach((cl) => {
                this.doClassif(currentString, cl, result);
            });
        } else {
            result.push(currentString);
        }
    }

    flattenClassification(elt) {
        let result = [];
        if (elt.classification) {
            elt.classification.forEach((cl) => {
                if (cl.elements) {
                    cl.elements.forEach((subCl) => {
                        this.doClassif(cl.stewardOrg.name, subCl, result);
                    });
                }
            });
        }
        return result;
    }
}
