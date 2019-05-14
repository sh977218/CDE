import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import _isEqual from 'lodash/isEqual';
import _uniqWith from 'lodash/uniqWith';
import { AlertService } from 'alert/alert.service';
import { ElasticService } from '_app/elastic.service';
import { SearchSettingsElastic } from 'search/search.model';
import { ClassificationHistory } from 'shared/models.model';

@Injectable()
export class ClassificationService {
    constructor(
        private alert: AlertService,
        public esService: ElasticService,
        public http: HttpClient,
        private localStorageService: LocalStorageService,
    ) {
    }

    updateClassificationLocalStorage(item: ClassificationHistory) {
        let allPossibleCategories: string[][] = [];
        let accumulateCategories: string[] = [];
        (item.categories || []).forEach((i: string) => {
            allPossibleCategories.push(accumulateCategories.concat(i));
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


    classifyItem(elt, org, classifArray, endPoint, cb) {
        let postBody = {
            categories: classifArray,
            eltId: elt._id,
            orgName: org
        };
        this.http.post(endPoint, postBody, {responseType: 'text'}).subscribe(
            () => {
                this.updateClassificationLocalStorage(postBody);
                cb();
            }, cb);
    }

    removeClassification(elt, org, classifArray, endPoint, cb) {
        let deleteBody = {
            categories: classifArray,
            eltId: elt._id,
            orgName: org
        };
        this.http.post(endPoint, deleteBody).subscribe(() => cb(), cb);
    }

    removeOrgClassification(deleteClassification, cb) {
        let settings = new SearchSettingsElastic(this.esService.getUserDefaultStatuses(), 10000);
        let ro = {
            deleteClassification: deleteClassification,
            settings: settings,
        };
        this.http.post('/server/classification/deleteOrgClassification/', ro, {responseType: 'text'}).subscribe(
            res => cb(res),
            () => this.alert.addAlert('danger', "Unexpected error removing classification"));
    }

    reclassifyOrgClassification(oldClassification, newClassification, cb) {
        let settings = new SearchSettingsElastic(this.esService.getUserDefaultStatuses(), 10000);
        let postBody = {
            settings: settings,
            oldClassification: oldClassification,
            newClassification: newClassification
        };
        this.http.post('/server/classification/reclassifyOrgClassification/', postBody, {responseType: 'text'}).subscribe(
            res => cb(res),
            () => this.alert.addAlert('danger', "Unexpected error reclassifying"));
    }

    renameOrgClassification(newClassification, cb) {
        let settings = new SearchSettingsElastic(this.esService.getUserDefaultStatuses(), 10000);
        let postBody = {
            settings: settings,
            newClassification: newClassification
        };
        this.http.post('/server/classification/renameOrgClassification', postBody, {responseType: 'text'}).subscribe(
            res => cb(res),
            () => this.alert.addAlert('danger', "Unexpected error renaming classification"));
    }

    addChildClassification(newClassification, cb) {
        let putBody = {
            newClassification: newClassification
        };
        this.http.put('/server/classification/addOrgClassification/', putBody, {responseType: 'text'}).subscribe(
            res => cb(res),
            (err) => {
                if (err.status === 409) this.alert.addAlert('danger', "Classification Already Exists");
                this.alert.addAlert('danger', "Unexpected error adding classification: " + err.status);
            });
    }
}
