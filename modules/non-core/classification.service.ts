import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ElasticService } from '_app/elastic.service';
import { AlertService } from 'alert/alert.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import _isEqual from 'lodash/isEqual';
import _uniqWith from 'lodash/uniqWith';
import { Cb1, CbErr, CbErrorObj, ClassificationHistory, Item, ItemClassification } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';

@Injectable()
export class ClassificationService {
    constructor(private alert: AlertService,
                public esService: ElasticService,
                public http: HttpClient,
                private localStorageService: LocalStorage) {
    }

    updateClassificationLocalStorage(item: ClassificationHistory) {
        const allPossibleCategories: string[][] = [];
        const accumulateCategories: string[] = [];
        (item.categories || []).forEach((i: string) => {
            allPossibleCategories.push(accumulateCategories.concat(i));
            accumulateCategories.push(i);
        });
        this.localStorageService
            .getItem('classificationHistory')
            .subscribe((recentlyClassification: any[]) => {
                if (!recentlyClassification) {
                    recentlyClassification = [];
                }
                allPossibleCategories.forEach(i => recentlyClassification.unshift({
                    categories: i,
                    orgName: item.orgName
                }));
                recentlyClassification = _uniqWith(recentlyClassification, (a, b) =>
                    _isEqual(a.categories, b.categories) && _isEqual(a.orgName, b.orgName));
                this.localStorageService
                    .setItem('classificationHistory', recentlyClassification)
                    .subscribe();
            });

    }

    classifyItem(elt: Item, org: string | undefined, classifArray: string[] | undefined, endPoint: string,
                 cb: CbErrorObj<HttpErrorResponse>) {
        const postBody: ItemClassification = {
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
        const deleteBody: ItemClassification = {
            categories: classifArray,
            eltId: elt._id,
            orgName: org
        };
        this.http.post(endPoint, deleteBody).subscribe(() => cb(), cb);
    }

    removeOrgClassification(deleteClassification: ClassificationHistory, next: Cb1<string>) {
        const settings = new SearchSettingsElastic(this.esService.getUserDefaultStatuses(), 10000);
        this.http.post('/server/classification/deleteOrgClassification/', {
            orgName: deleteClassification.orgName,
            deleteClassification,
            settings,
        }, {responseType: 'text'}).subscribe(
            next,
            () => this.alert.addAlert('danger', 'Unexpected error removing classification')
        );
    }

    reclassifyOrgClassification(oldClassification: ClassificationHistory, newClassification: ClassificationHistory, next: Cb1<string>) {
        const settings = new SearchSettingsElastic(this.esService.getUserDefaultStatuses(), 10000);
        this.http.post('/server/classification/reclassifyOrgClassification/', {
            settings,
            oldClassification,
            newClassification,
            orgName: newClassification.orgName
        }, {responseType: 'text'}).subscribe(
            next,
            () => this.alert.addAlert('danger', 'Unexpected error reclassifying')
        );
    }

    renameOrgClassification(newClassification: ClassificationHistory, next: Cb1<string>) {
        const settings = new SearchSettingsElastic(this.esService.getUserDefaultStatuses(), 10000);
        this.http.post('/server/classification/renameOrgClassification', {
            settings,
            orgName: newClassification.orgName,
            newClassification
        }, {responseType: 'text'}).subscribe(
            next,
            () => this.alert.addAlert('danger', 'Unexpected error renaming classification')
        );
    }

    addChildClassification(newClassification: ClassificationHistory, next: Cb1<string>) {
        this.http.put('/server/classification/addOrgClassification/', {
            newClassification,
            orgName: newClassification.orgName
        }, {responseType: 'text'}).subscribe(
            next,
            (err: HttpErrorResponse) => {
                if (err.status === 409) {
                    this.alert.addAlert('danger', 'Classification Already Exists');
                }
                this.alert.addAlert('danger', 'Unexpected error adding classification: ' + err.status);
            }
        );
    }
}
