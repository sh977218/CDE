import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { UserService } from '_app/user.service';
import { DataElement } from 'shared/de/dataElement.model';
import { ITEM_MAP } from 'shared/item';
import { isOrgCurator } from 'shared/system/authorizationShared';

@Injectable()
export class DataElementViewService {
    constructor(private http: HttpClient,
                private userService: UserService) {
    }

    fetchEltForEditing(queryParams: Params): Promise<DataElement> {
        if (!queryParams.tinyId) {
            return this.fetchPublished(queryParams);
        }
        return this.userService.then(user => {
            if (!isOrgCurator(user)) {
                return this.fetchPublished(queryParams);
            }
            return this.http.get<DataElement>(ITEM_MAP.cde.apiDraft + queryParams.tinyId).toPromise()
                .then(elt => {
                    if (!elt) {
                        return this.fetchPublished(queryParams);
                    }
                    return elt;
                })
                .catch((err: HttpErrorResponse) => {
                    if (err.status === 403) {
                        return this.fetchPublished(queryParams);
                    }
                    throw err;
                });
        }, () => this.fetchPublished(queryParams));
    }

    fetchPublished(queryParams: Params): Promise<DataElement> {
        let url;
        if (queryParams.cdeId) {
            url = ITEM_MAP.cde.apiById + queryParams.cdeId;
        } else {
            url = ITEM_MAP.cde.api + queryParams.tinyId;
            if (queryParams.version) {
                url = url + '/version/' + queryParams.version;
            }
        }
        return this.http.get<DataElement>(url).toPromise();
    }
}
