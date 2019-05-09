import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';

@Component({
    selector: 'cde-org-account-management',
    templateUrl: './orgAccountManagement.component.html',
})
export class OrgAccountManagementComponent {


    constructor(private http: HttpClient,
                private alert: AlertService,
                public userService: UserService) {
    }

}
