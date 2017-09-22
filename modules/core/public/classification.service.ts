import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { LocalStorageService } from "angular-2-local-storage";
import * as _ from 'lodash';
import { AlertService } from 'system/public/components/alert/alert.service';
import { ElasticService } from "./elastic.service";

@Injectable()
export class ClassificationService {

    constructor(public http: Http,
                private localStorageService: LocalStorageService,
                public esService: ElasticService,
                private alert: AlertService) {
    }

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

    public removeClassification(elt, org, classifArray, endPoint, cb) {
        let deleteBody = {
            categories: classifArray,
            eltId: elt._id,
            orgName: org
        };
        this.http.post(endPoint, deleteBody).map(res => res.json()).subscribe(res => cb(), (err) => cb(err));
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

    removeOrgClassification(deleteClassification, cb) {
        let settings = {
            resultPerPage: 10000,
            searchTerm: "",
            page: 1,
            selectedStatuses: this.esService.getUserDefaultStatuses()
        };
        let ro = new RequestOptions({
            body: {
                deleteClassification: deleteClassification,
                settings: settings,
            }
        });
        this.http.delete("/orgClassification/", ro)
            .map(res => res.text()).subscribe(
            res => cb(res),
            err => this.alert.addAlert("danger", err));
    };

    reclassifyOrgClassification(oldClassification, newClassification, cb) {
        let settings = {
            resultPerPage: 10000,
            searchTerm: "",
            page: 1,
            selectedStatuses: this.esService.getUserDefaultStatuses()
        };
        let postBody = {
            settings: settings,
            oldClassification: oldClassification,
            newClassification: newClassification
        };
        this.http.post("/orgReclassification/", postBody)
            .map(res => res.text()).subscribe(
            res => cb(res),
            err => this.alert.addAlert("danger", err));
    }

    renameOrgClassification(newClassification, cb) {
        let settings = {
            resultPerPage: 10000,
            searchTerm: "",
            page: 1,
            selectedStatuses: this.esService.getUserDefaultStatuses()
        };
        let postBody = {
            settings: settings,
            newClassification: newClassification
        };
        this.http.post("/OrgClassification/rename", postBody)
            .map(res => res.text()).subscribe(
            res => cb(res),
            err => this.alert.addAlert("danger", err));
    };

    addChildClassification(orgName, categories, cb) {
        let putBody = {categories: categories};
        this.http.put("/orgClassification/" + orgName, putBody)
            .map(res => res.text()).subscribe(
            res => cb(res),
            err => this.alert.addAlert("danger", err));
    };

}
