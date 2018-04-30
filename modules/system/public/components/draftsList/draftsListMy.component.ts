import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
    selector: 'cde-drafts-my-list',
    templateUrl: 'draftsList.component.html'
})
export class DraftsListMyComponent {

    drafts: any = {};

    constructor(private http: HttpClient) {
        this.http.get('/myDrafts').subscribe(r => this.drafts = r);
    }

}