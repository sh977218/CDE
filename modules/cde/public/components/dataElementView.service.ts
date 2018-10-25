import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { UserService } from '_app/user.service';
import { DataElement } from 'shared/de/dataElement.model';
import { canEditCuratedItem } from 'shared/system/authorizationShared';

@Injectable()
export class DataElementViewService {
    constructor(private http: HttpClient,
                private userService: UserService) {
    }

    private fetchDraft(queryParams: Params) {
        return this.http.get<DataElement>('/draftDataElement/' + queryParams['tinyId']).toPromise();
    }

    fetchEltForEditing(queryParams: Params) {
        return this.userService.then(user => {
            return this.fetchDraft(queryParams).then(draft => {
                return draft && canEditCuratedItem(user, draft)
                    ? draft
                    : this.fetchPublished(queryParams);
            }, () => this.fetchPublished(queryParams));
        }, () => this.fetchPublished(queryParams));
    }

    fetchPublished(queryParams: Params) {
        let cdeId = queryParams['cdeId'];
        let url = '/de/' + queryParams['tinyId'];
        let version = queryParams['version'];
        if (version) url = url + '/version/' + version;
        if (cdeId) url = '/deById/' + cdeId;
        return this.http.get<DataElement>(url).toPromise();
    }
}
