import { Http } from "@angular/http";
import { Component, Inject, ViewChild } from "@angular/core";
import { Select2OptionData } from "ng2-select2";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs/Rx";
import { AlertService } from "../../alert/alert.service";
import { SharedService } from "../../../../../core/public/shared.service";

@Component({
    selector: "cde-users-mgt",
    providers: [NgbActiveModal],
    templateUrl: "./usersMgt.component.html"
})

export class UsersMgtComponent {
    @ViewChild("newUserContent") public newUserContent: NgbModalModule;
    formatter = (result: any) => result.username;
    foundUsers: any[] = [];
    modalRef: NgbModalRef;
    newUsername: string;
    rolesEnum: Select2OptionData[] = SharedService.auth.rolesEnum.map(r => {
        return {"id": r, "text": r};
    });
    s2Options: Select2Options = {
        multiple: true
    };

    search: any = {username: ""};

    constructor(private http: Http,
                private Alert: AlertService,
                @Inject("AccountManagement") private AccountManagement,
                public modalService: NgbModal
                ) {}

    addNewUser() {
        this.http.put("/user", {username: this.newUsername}).subscribe(
            () => this.Alert.addAlert("success", "User created"),
            () => this.Alert.addAlert("danger", "Cannot create user. Does it already exist?")
        );
        this.modalRef.close();
    }

    static getEltLink (c) {
        return {
                cde: "/deView?tinyId=",
                form: "/formView?tinyId=",
                board: "/board/"
            }[c.element.eltType] + c.element.eltId;
    }

    openNewUserModal() {
        this.modalRef = this.modalService.open(this.newUserContent, {size: "lg"});
    }

    searchTypeahead = (text$: Observable<string>) =>
        text$.debounceTime(300).distinctUntilChanged().switchMap(term =>
            term.length < 3 ? [] : this.http.get("/searchUsers/" + term).map(r => r.json()).map(r => r.users)
                .catch(() => Observable.of([]))
        );

    searchUsers() {
        let uname = this.search.username.username ? this.search.username.username : this.search.username;
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
        if (data.value !== user.roles) {
            user.roles = data.value;
            this.http.post("/updateUserRoles", user).subscribe(
                () => {
                    this.Alert.addAlert("success", "Roles saved.");
                });
        }
    }
}
