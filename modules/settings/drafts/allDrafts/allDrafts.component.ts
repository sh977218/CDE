import { Component } from '@angular/core';
import { Drafts } from 'shared/models.model';
import { HttpClient } from '@angular/common/http';
import { AlertService } from 'alert/alert.service';

@Component({
    selector: 'cde-all-drafts',
    templateUrl: '../drafts.component.html'
})
export class AllDraftsComponent {
    drafts?: Drafts;
    title: string = 'All';

    constructor(private http: HttpClient,
                private alert: AlertService) {
        this.http.get<Drafts>('/allDrafts')
            .subscribe(res => this.drafts = res,
                err => this.alert.httpErrorMessageAlert(err)
            );
    }
}
