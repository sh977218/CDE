import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { UserService } from '_app/user.service';
import { CdeForm, CdeFormDraft } from 'shared/form/form.model';
import { ITEM_MAP } from 'shared/item';
import { toPromise } from 'shared/observable';
import { canEditCuratedItem } from 'shared/security/authorizationShared';

@Injectable({ providedIn: 'root' })
export class FormViewService {
    constructor(private http: HttpClient, private userService: UserService) {}

    fetchEltForEditing(queryParams: Params): Promise<CdeForm> {
        if (!queryParams.tinyId) {
            return this.fetchEltPublishedForEditing(queryParams);
        }
        return this.fetchEltPublishedForEditing(queryParams).then(elt => {
            return this.userService.waitForUser().then(
                user => {
                    if (!canEditCuratedItem(user, elt)) {
                        return elt;
                    }
                    return toPromise(this.http.get<CdeForm>(ITEM_MAP.form.apiDraft + queryParams.tinyId))
                        .then(draft => draft || elt)
                        .catch((err: HttpErrorResponse) => {
                            if (err.status === 403) {
                                return elt;
                            }
                            throw err;
                        });
                },
                () => elt
            );
        });
    }

    fetchEltPublishedForEditing(queryParams: Params): Promise<CdeForm> {
        return toPromise(
            this.http.get<CdeForm>(
                queryParams.formId
                    ? '/server/form/forEditById/' + queryParams.formId
                    : '/server/form/forEdit/' +
                          queryParams.tinyId +
                          (queryParams.version ? '/version/' + queryParams.version : '')
            )
        );
    }

    fetchPublished(queryParams: Params): Promise<CdeForm> {
        return toPromise(
            this.http.get<CdeForm>(
                queryParams.formId
                    ? ITEM_MAP.form.apiById + queryParams.formId
                    : ITEM_MAP.form.api +
                          queryParams.tinyId +
                          (queryParams.version ? '/version/' + queryParams.version : '')
            )
        );
    }

    removeDraft(elt: CdeFormDraft) {
        return this.http.delete('/server/form/draft/' + elt.tinyId, { responseType: 'text' });
    }
}
