import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { uniqWith, isEqual } from 'lodash';
import { LocalStorageService } from 'non-core/localStorage.service';
import { Item } from 'shared/item';
import { Cb1, CbErrorObj, ItemClassification, ItemClassificationElt, ItemClassificationNew } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';

@Injectable({ providedIn: 'root' })
export class ClassificationService {
    constructor(
        private alert: AlertService,
        public http: HttpClient,
        private localStorageService: LocalStorageService
    ) {}

    updateClassificationLocalStorage(item: ItemClassification) {
        const allPossibleCategories: string[][] = [];
        const accumulateCategories: string[] = [];
        (item.categories || []).forEach((i: string) => {
            allPossibleCategories.push(accumulateCategories.concat(i));
            accumulateCategories.push(i);
        });
        let recentlyClassification = this.localStorageService.getItem('classificationHistory');
        if (!recentlyClassification) {
            recentlyClassification = [];
        }
        allPossibleCategories.forEach(i =>
            recentlyClassification.unshift({
                categories: i,
                orgName: item.orgName,
            })
        );
        recentlyClassification = uniqWith(
            recentlyClassification,
            (a: any, b: any) => isEqual(a.categories, b.categories) && isEqual(a.orgName, b.orgName)
        );
        this.localStorageService.setItem('classificationHistory', recentlyClassification);
    }

    classifyItem(
        elt: Item,
        org: string,
        classifArray: string[],
        endPoint: string,
        cb: CbErrorObj<HttpErrorResponse | void>
    ) {
        const postBody: ItemClassificationElt = {
            categories: classifArray,
            eltId: elt._id,
            orgName: org,
        };
        this.http.post(endPoint, postBody, { responseType: 'text' }).subscribe(() => {
            this.updateClassificationLocalStorage(postBody);
            cb();
        }, cb);
    }

    removeClassification(elt: Item, org: string, classifArray: string[], endPoint: string, cb: Cb1<string | void>) {
        const deleteBody: ItemClassification = {
            categories: classifArray,
            eltId: elt._id,
            orgName: org,
        };
        this.http.post(endPoint, deleteBody).subscribe({ next: () => cb(), error: cb });
    }

    removeOrgClassification(deleteClassification: ItemClassification, next: Cb1<string>) {
        const settings = new SearchSettingsElastic(10000);
        this.http
            .post(
                '/server/classification/deleteOrgClassification/',
                {
                    orgName: deleteClassification.orgName,
                    deleteClassification,
                    settings,
                },
                { responseType: 'text' }
            )
            .subscribe(next, () => this.alert.addAlert('danger', 'Unexpected error removing classification'));
    }

    reclassifyOrgClassification(
        oldClassification: ItemClassification,
        newClassification: ItemClassification,
        next: Cb1<string>
    ) {
        const settings = new SearchSettingsElastic(10000);
        this.http
            .post(
                '/server/classification/reclassifyOrgClassification/',
                {
                    settings,
                    oldClassification,
                    newClassification,
                    orgName: newClassification.orgName,
                },
                { responseType: 'text' }
            )
            .subscribe(next, () => this.alert.addAlert('danger', 'Unexpected error reclassifying'));
    }

    renameOrgClassification(newClassification: ItemClassificationNew, next: Cb1<string>) {
        const settings = new SearchSettingsElastic(10000);
        this.http
            .post(
                '/server/classification/renameOrgClassification',
                {
                    settings,
                    orgName: newClassification.orgName,
                    newClassification,
                },
                { responseType: 'text' }
            )
            .subscribe(next, () => this.alert.addAlert('danger', 'Unexpected error renaming classification'));
    }

    addChildClassification(newClassification: ItemClassification, next: Cb1<string>) {
        this.http
            .put(
                '/server/classification/addOrgClassification/',
                {
                    newClassification,
                    orgName: newClassification.orgName,
                },
                { responseType: 'text' }
            )
            .subscribe(next, (err: HttpErrorResponse) => {
                if (err.status === 409) {
                    this.alert.addAlert('danger', 'Classification Already Exists');
                } else {
                    this.alert.addAlert('danger', 'Unexpected error adding classification: ' + err.status);
                }
            });
    }
}
