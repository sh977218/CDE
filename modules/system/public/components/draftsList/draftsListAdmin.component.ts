import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
    selector: 'cde-drafts-admin-list',
    templateUrl: 'draftsList.component.html'
})
export class DraftsListAdminComponent {

    drafts: any = {};

    constructor(private http: HttpClient) {
        this.http.get('/allDrafts').subscribe(r => this.drafts = r);
    }

}