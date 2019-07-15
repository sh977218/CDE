import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ElasticService } from '_app/elastic.service';
import { AlertService } from 'alert/alert.service';
import { LocalStorageService } from 'angular-2-local-storage';
import _isEqual from 'lodash/isEqual';
import _uniqWith from 'lodash/uniqWith';
import { SearchSettingsElastic } from 'search/search.model';
import { CbErr, CbErrObj, ClassificationHistory, Item, ItemClassification } from 'shared/models.model';

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


    classifyItem(elt: Item, org: string | undefined, classifArray: string[] | undefined, endPoint: string, cb: CbErrObj<HttpErrorResponse>) {
        let postBody: ItemClassification = {
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

    removeClassification(elt: Item, org: string, classifArray: string[], endPoint: string, cb: CbErr) {
        let deleteBody: ItemClassification = {
            categories: classifArray,
            eltId: elt._id,
            orgName: org
        };
        this.http.post(endPoint, deleteBody).subscribe(() => cb(), cb);
    }

    removeOrgClassification(deleteClassification, cb) {
        let settings = new SearchSettingsElastic(this.esService.getUserDefaultStatuses(), 10000);
        let ro = {
            deleteClassification,
            settings,
        };
        this.http.post('/server/classification/deleteOrgClassification/', ro, {responseType: 'text'}).subscribe(
            res => cb(res),
            () => this.alert.addAlert('danger', "Unexpected error removing classification"));
    }

    reclassifyOrgClassification(oldClassification, newClassification, cb) {
        let settings = new SearchSettingsElastic(this.esService.getUserDefaultStatuses(), 10000);
        let postBody = {
            settings,
            oldClassification,
            newClassification
        };
        this.http.post('/server/classification/reclassifyOrgClassification/', postBody, {responseType: 'text'}).subscribe(
            res => cb(res),
            () => this.alert.addAlert('danger', "Unexpected error reclassifying"));
    }

    renameOrgClassification(newClassification, cb) {
        let settings = new SearchSettingsElastic(this.esService.getUserDefaultStatuses(), 10000);
        let postBody = {
            settings,
            newClassification
        };
        this.http.post('/server/classification/renameOrgClassification', postBody, {responseType: 'text'}).subscribe(
            res => cb(res),
            () => this.alert.addAlert('danger', "Unexpected error renaming classification"));
    }

    addChildClassification(newClassification, cb) {
        let putBody = {
            newClassification
        };
        this.http.put('/server/classification/addOrgClassification/', putBody, {responseType: 'text'}).subscribe(
            res => cb(res),
            (err: HttpErrorResponse) => {
                if (err.status === 409) this.alert.addAlert('danger', "Classification Already Exists");
                this.alert.addAlert('danger', "Unexpected error adding classification: " + err.status);
            });
    }
}
