import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Select2OptionData } from 'ng2-select2';

import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';
import { SharedService } from '_commonApp/shared.service';


@Component({
    selector: 'cde-users-mgt',
    providers: [NgbActiveModal],
    templateUrl: './usersMgt.component.html'
})
export class UsersMgtComponent {
    @ViewChild('newUserContent') public newUserContent: NgbModalModule;
    foundUsers: any[] = [];
    modalRef: NgbModalRef;
    newUsername: string;
    rolesEnum: Select2OptionData[] = SharedService.auth.rolesEnum.map(r => {
        return {'id': r, 'text': r};
    });
    search: any = {username: ''};
    s2Options: Select2Options = {
        multiple: true
    };

    constructor(
        private Alert: AlertService,
        private http: HttpClient,
        public modalService: NgbModal,
        public userService: UserService,
    ) {}

    addNewUser() {
        this.http.put('/user', {username: this.newUsername}, {responseType: 'text'}).subscribe(
            () => this.Alert.addAlert('success', 'User created'),
            () => this.Alert.addAlert('danger', 'Cannot create user. Does it already exist?')
        );
        this.modalRef.close();
    }

    openNewUserModal() {
        this.modalRef = this.modalService.open(this.newUserContent, {size: 'lg'});
    }

    searchUsers() {
        let uname = this.search.username.username ? this.search.username.username : this.search.username;
        this.http.get<any>('/searchUsers/' + uname).subscribe(
            result => {
                this.foundUsers = result.users;
            });
    }

    updateAvatar(user) {
        this.http.post('/updateUserAvatar', user).subscribe(
            () => {
                this.Alert.addAlert('success', 'Saved.');
            });
    }

    updateRoles(user, data: {value: string[]}) {
        if (data.value !== user.roles) {
            user.roles = data.value;
            this.http.post('/updateUserRoles', user).subscribe(
                () => {
                    this.Alert.addAlert('success', 'Roles saved.');
                });
        }
    }

    updateTesterStatus(user, newValue) {
        user.tester = newValue;
        this.http.post('/updateTesterStatus', user).subscribe(
            () => {
                this.Alert.addAlert('success', 'Saved.');
            });
    }
}
