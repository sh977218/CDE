import { Component } from '@angular/core';
import { Drafts } from 'shared/models.model';
import { HttpClient } from '@angular/common/http';
import { AlertService } from 'alert/alert.service';

@Component({
    selector: 'cde-my-drafts',
    templateUrl: '../drafts.component.html'
})
export class MyDraftsComponent {
    drafts?: Drafts;
    title: string = 'My';

    constructor(private http: HttpClient,
                private alert: AlertService) {
        this.http.get<Drafts>('/myDrafts')
            .subscribe(res => this.drafts = res,
                err => this.alert.httpErrorMessageAlert(err)
            );
    }
}