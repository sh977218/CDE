import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { PublishedForm, User } from 'shared/models.model';

@Component({
    selector: 'cde-my-published-forms',
    templateUrl: 'myPublishedForms.component.html'
})
export class MyPublishedFormsComponent {
    constructor(private http: HttpClient,
                private alert: AlertService,
                private userService: UserService) {
    }

    removePublishedForm(user: User, pf: PublishedForm) {
        user.publishedForms = user.publishedForms ? user.publishedForms.filter(p =>
            p.id !== pf.id) : [];
        this.userService.save();
    }

    get user(): User | undefined {
        return this.userService.user;
    }
}
