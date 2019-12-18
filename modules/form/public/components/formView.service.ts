import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { UserService } from '_app/user.service';
import { CdeForm } from 'shared/form/form.model';
import { ITEM_MAP } from 'shared/item';
import { isOrgCurator } from 'shared/system/authorizationShared';

@Injectable()
export class FormViewService {
    constructor(private http: HttpClient,
                private userService: UserService) {
    }

    fetchEltForEditing(queryParams: Params): Promise<CdeForm> {
        if (!queryParams.tinyId) {
            return this.fetchEltPublishedForEditing(queryParams);
        }
        return this.userService.then(user => {
            if (!isOrgCurator(user)) {
                return this.fetchEltPublishedForEditing(queryParams);
            }
            return this.http.get<CdeForm>(ITEM_MAP.form.apiDraft + queryParams.tinyId).toPromise()
                .then(elt => {
                    if (!elt) {
                        return this.fetchEltPublishedForEditing(queryParams);
                    }
                    return elt;
                })
                .catch((err: HttpErrorResponse) => {
                    if (err.status === 403) {
                        return this.fetchEltPublishedForEditing(queryParams);
                    }
                    throw err;
                });
        }, () => this.fetchEltPublishedForEditing(queryParams));
    }

    fetchEltPublishedForEditing(queryParams: Params): Promise<CdeForm> {
        let url;
        if (queryParams.formId) {
            url = '/server/form/formForEditById/' + queryParams.formId;
        } else {
            url = '/server/form/formForEdit/' + queryParams.tinyId;
            if (queryParams.version) {
                url = url + '/version/' + queryParams.version;
            }
        }
        return this.http.get<CdeForm>(url).toPromise();
    }

    fetchPublished(queryParams: Params): Promise<CdeForm> {
        let url;
        if (queryParams.formId) {
            url = ITEM_MAP.form.apiById + queryParams.formId;
        } else {
            url = ITEM_MAP.form.api + queryParams.tinyId;
            if (queryParams.version) {
                url = url + '/version/' + queryParams.version;
            }
        }
        return this.http.get<CdeForm>(url).toPromise();
    }
}
