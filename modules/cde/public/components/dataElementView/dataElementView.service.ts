import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { UserService } from '_app/user.service';
import { DataElement } from 'shared/de/dataElement.model';
import { ITEM_MAP } from 'shared/item';
import { canEditCuratedItem } from 'shared/security/authorizationShared';

@Injectable()
export class DataElementViewService {
    constructor(private http: HttpClient,
                private userService: UserService) {
    }

    fetchEltForEditing(queryParams: Params) {
        if (!queryParams.tinyId) {
            return this.fetchPublished(queryParams);
        }
        return this.fetchPublished(queryParams).then(elt => {
            return this.userService.then<DataElement>(user => {
                if (!canEditCuratedItem(user, elt)) {
                    return elt;
                }
                return this.http.get<DataElement>(ITEM_MAP.cde.apiDraft + queryParams.tinyId).toPromise()
                    .then(draft => draft || elt)
                    .catch((err: HttpErrorResponse) => {
                        if (err.status === 403) {
                            return elt;
                        }
                        throw err;
                    });
            }, () => elt);
        });
    }

    fetchPublished(queryParams: Params): Promise<DataElement> {
        return this.http.get<DataElement>(
            queryParams.cdeId
                ? ITEM_MAP.cde.apiById + queryParams.cdeId
                : ITEM_MAP.cde.api + queryParams.tinyId + (queryParams.version ? '/version/' + queryParams.version : '')
        ).toPromise();
    }
}
