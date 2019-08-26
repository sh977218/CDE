import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { PublishedForm, User } from 'shared/models.model';

@Component({
    selector: 'cde-my-published-forms',
    templateUrl: 'myPublishedForms.component.html'
})
export class MyPublishedFormsComponent {
    user?: User;

    constructor(private http: HttpClient,
                private alert: AlertService,
                private userService: UserService) {
        this.user = this.userService.user;
    }

    removePublishedForm(pf: PublishedForm) {
        this.user!.publishedForms = this.user!.publishedForms ? this.user!.publishedForms!.filter(p =>
            p.id !== pf.id) : [];
        this.saveProfile();
    }

    saveProfile() {
        this.http.post('/server/user/', this.user)
            .subscribe(() => this.alert.addAlert('success', 'Saved'),
                err => this.alert.httpErrorMessageAlert(err)
            );
    }
}
