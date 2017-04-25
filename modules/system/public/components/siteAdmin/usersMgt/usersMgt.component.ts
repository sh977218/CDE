import { Http } from "@angular/http";
import { Component, Inject, ViewChild } from "@angular/core";
import { Select2OptionData } from "ng2-select2";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";

//noinspection TypeScriptCheckImport
import * as authShared from "../../../../shared/authorizationShared";
import { Observable } from "rxjs/Rx";

@Component({
    selector: "cde-users-mgt",
    providers: [NgbActiveModal],
    templateUrl: "./usersMgt.component.html"
})

export class UsersMgtComponent {
    @ViewChild("newUserContent") public newUserContent: NgbModalModule;
    public modalRef: NgbModalRef;
    search: any = {username: ""};
    newUsername: string;
    foundUsers: any[] = [];
    //noinspection TypeScriptValidateTypes
    rolesEnum: Array<Select2OptionData> = authShared.rolesEnum.map(r => {
        return {"id": r, "text": r};
    });
    //noinspection TypeScriptUnresolvedVariable
    s2Options: Select2Options = {
        multiple: true
    };

    constructor(private http: Http,
                @Inject("Alert") private Alert,
                @Inject("AccountManagement") private AccountManagement,
                public modalService: NgbModal,
                public activeModal: NgbActiveModal) {
    }

    formatter = (result: any) => result.username;

    //noinspection TypeScriptValidateTypes
    searchTypeahead = (text$: Observable<string>) =>
        text$.debounceTime(300).distinctUntilChanged().switchMap(term => term.length < 3 ? [] :
            this.http.get("/searchUsers/" + term).map(r => r.json()).map(r => r.users)
                .catch(() => {
                    //noinspection TypeScriptUnresolvedFunction
                    return Observable.of([]);
                })
        )

    searchUsers() {
        let uname = this.search.username.username ? this.search.username.username : this.search.username;
        //noinspection TypeScriptValidateTypes
        this.http.get("/searchUsers/" + uname).map(res => res.json()).subscribe(
            result => {
                this.foundUsers = result.users;
            });
    }

    updateAvatar(user) {
        this.http.post("/updateUserAvatar", user).subscribe(
            () => {
                this.Alert.addAlert("success", "Saved.");
            });
    }

    updateTesterStatus(user, newValue) {
        user.tester = newValue;
        this.http.post("/updateTesterStatus", user).subscribe(
            () => {
                this.Alert.addAlert("success", "Saved.");
            });
    }

    updateRoles(user, data: {value: string[]}) {
        user.roles = data.value;
        this.http.post("/updateUserRoles", user).subscribe(
            () => {
                this.Alert.addAlert("success", "Roles saved.");
            });
    }

    addNewUser() {
        this.http.put("/user", {username: this.newUsername}).subscribe(
            () => this.Alert.addAlert("success", "User created"),
            () => this.Alert.addAlert("danger", "Cannot create user. Does it already exist?")
        );
        this.modalRef.close();
    }

    getEltLink(c) {
        return {
                cde: "/deview?tinyId=",
                form: "/formView?tinyId=",
                board: "/board/"
            }[c.element.eltType] + c.element.eltId;
    }

    openNewUserModal() {
        this.modalRef = this.modalService.open(this.newUserContent, {size: "lg"});
    }
}
