import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { LocalStorageService } from "angular-2-local-storage";
import * as _ from 'lodash';

@Injectable()
export class ClassificationService {

    constructor(public http: Http,
                private localStorageService: LocalStorageService) {}

    public updateClassificationLocalStorage(item) {
        let allPossibleCategories = [];
        let accumulateCategories = [];
        item.categories.forEach(i => {
            allPossibleCategories.push(accumulateCategories.concat([i]));
            accumulateCategories.push(i);
        });
        let recentlyClassification = <Array<any>>this.localStorageService.get("classificationHistory");
        if (!recentlyClassification) recentlyClassification = [];
        allPossibleCategories.forEach(i => recentlyClassification.unshift({
            categories: i,
            eltId: item.eltId,
            orgName: item.orgName
        }));
        recentlyClassification = _.uniqWith(recentlyClassification, (a, b) =>
            _.isEqual(a.categories, b.categories) && _.isEqual(a.orgName, b.orgName));
        this.localStorageService.set("classificationHistory", recentlyClassification);
    }


    public classifyItem(elt, org, classifArray, endPoint, cb) {
        let postBody = {
            categories: classifArray,
            eltId: elt._id,
            orgName: org
        };
        this.http.post(endPoint, postBody).subscribe(
            () => {
                this.updateClassificationLocalStorage(postBody);
                cb();
            }, err => cb(err));
    }

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
