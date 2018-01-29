import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import _isEqual from 'lodash/isEqual';
import _uniqWith from 'lodash/uniqWith';

import { AlertService } from '_app/alert/alert.service';
import { ElasticService } from '_app/elastic.service';


@Injectable()
export class ClassificationService {
    constructor(
        private alert: AlertService,
        public esService: ElasticService,
        public http: HttpClient,
        private localStorageService: LocalStorageService,
    ) {
    }

    public updateClassificationLocalStorage(item) {
        let allPossibleCategories = [];
        let accumulateCategories = [];
        item.categories.forEach(i => {
            allPossibleCategories.push(accumulateCategories.concat([i]));
            accumulateCategories.push(i);
        });
        let recentlyClassification = <Array<any>>this.localStorageService.get('classificationHistory');
        if (!recentlyClassification) recentlyClassification = [];
        allPossibleCategories.forEach(i => recentlyClassification.unshift({
            categories: i,
            orgName: item.orgName
        }));
        recentlyClassification = _uniqWith(recentlyClassification, (a, b) =>
            _isEqual(a.categories, b.categories) && _isEqual(a.orgName, b.orgName));
        this.localStorageService.set('classificationHistory', recentlyClassification);
    }


    public classifyItem(elt, org, classifArray, endPoint, cb) {
        let postBody = {
            categories: classifArray,
            eltId: elt._id,
            orgName: org
        };
        this.http.post(endPoint, postBody, {responseType: 'text'}).subscribe(
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
        this.http.post(endPoint, deleteBody).subscribe(res => cb(), (err) => cb(err));
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
            currentString = currentString + ' | ';
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
            searchTerm: '',
            page: 1,
            selectedStatuses: this.esService.getUserDefaultStatuses()
        };
        let ro = {
            body: {
                deleteClassification: deleteClassification,
                settings: settings,
            }
        };
        this.http.post('/orgClassification/', ro, {responseType: 'text'}).subscribe(
            res => cb(res),
            err => this.alert.addAlert('danger', err));
    }

    reclassifyOrgClassification(oldClassification, newClassification, cb) {
        let settings = {
            resultPerPage: 10000,
            searchTerm: '',
            page: 1,
            selectedStatuses: this.esService.getUserDefaultStatuses()
        };
        let postBody = {
            settings: settings,
            oldClassification: oldClassification,
            newClassification: newClassification
        };
        this.http.post('/orgReclassification/', postBody, {responseType: 'text'}).subscribe(
            res => cb(res),
            err => this.alert.addAlert('danger', err));
    }

    renameOrgClassification(newClassification, cb) {
        let settings = {
            resultPerPage: 10000,
            searchTerm: '',
            page: 1,
            selectedStatuses: this.esService.getUserDefaultStatuses()
        };
        let postBody = {
            settings: settings,
            newClassification: newClassification
        };
        this.http.post('/OrgClassification/rename', postBody, {responseType: 'text'}).subscribe(
            res => cb(res),
            err => this.alert.addAlert('danger', err));
    }

    addChildClassification(newClassification, cb) {
        let putBody = {
            newClassification: newClassification
        };
        this.http.put('/orgClassification/', putBody, {responseType: 'text'}).subscribe(
            res => cb(res),
            err => this.alert.addAlert('danger', err));
    }
}
