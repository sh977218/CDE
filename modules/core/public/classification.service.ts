import { Injectable } from '@angular/core';

@Injectable()
export class ClassificationService {
    sortClassification(elt) {
        elt.classification = elt.classification.sort(function (c1, c2) {
            return c1.stewardOrg.name.localeCompare(c2.stewardOrg.name);
        });
        var sortSubClassif = function (classif) {
            if (classif.elements) {
                classif.elements = classif.elements.sort(function (c1, c2) {
                    if (!c1.name)
                        console.log('h');
                    return c1.name.localeCompare(c2.name);
                });
            }
        };
        var doRecurse = function (classif) {
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
            currentString = currentString + ' | ';
        }
        currentString = currentString + classif.name;
        if (classif.elements && classif.elements.length > 0) {
            classif.elements.forEach(function (cl) {
                this.doClassif(currentString, cl, result);
            });
        } else {
            result.push(currentString);
        }
    }

    flattenClassification = function(elt) {
        var result = [];
        if (elt.classification) {
            elt.classification.forEach(function (cl) {
                if (cl.elements) {
                    cl.elements.forEach(function (subCl) {
                        this.doClassif(cl.stewardOrg.name, subCl, result);
                    });
                }
            });
        }
        return result;
    }
}
