import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { UserService } from '_app/user.service';
import { CdeForm } from 'shared/form/form.model';
import { canEditCuratedItem } from 'shared/system/authorizationShared';

@Injectable()
export class FormViewService {
    constructor(private http: HttpClient,
                private userService: UserService) {
    }

    fetchEltForEditing(queryParams: Params): Promise<CdeForm> {
        return this.http.get<CdeForm>('/draftForm/' + queryParams['tinyId']).toPromise()
            .catch(() => this.fetchPublished(queryParams));
    }

    fetchPublished(queryParams: Params) {
        let formId = queryParams['formId'];
        let url = '/form/' + queryParams['tinyId'];
        let version = queryParams['version'];
        if (version) url = url + '/version/' + version;
        if (formId) url = '/formById/' + formId;
        return this.http.get<CdeForm>(url).toPromise();
    }
}
