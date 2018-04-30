import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
    selector: 'cde-drafts-org-list',
    templateUrl: 'draftsList.component.html'
})
export class DraftsListOrgComponent {

    drafts: any = {};

    constructor(private http: HttpClient) {
        this.http.get('/orgDrafts').subscribe(r => this.drafts = r);
    }

}