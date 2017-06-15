import { Component, Inject } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { User } from "../../../core/public/models.model";
import { AlertService } from "./alert/alert.service";

@Component({
    selector: "cde-profile",
    templateUrl: "profile.component.html"
})
export class ProfileComponent {
    cdes: any;
    forms: any;
    hasQuota: any;
    orgCurator: string;
    orgAdmin: string;
    user: User;

    constructor(private http: Http,
                private alert: AlertService,
                @Inject("userResource") private userService,
                @Inject("ViewingHistory") private viewingHistoryService) {
        viewingHistoryService.getViewingHistory();
        viewingHistoryService.getCdes().then((response) => {
            this.cdes = [];
            if (Array.isArray(response))
                this.cdes = response;
        });
        viewingHistoryService.getForms().then((response) => {
            this.forms = [];
            if (Array.isArray(response))
                this.forms = response;
        });
        this.reloadUser();
    }

    saveProfile() {
        this.http.post("/user/me", this.user)
            .subscribe(
                () => {
                    this.reloadUser();
                    this.alert.addAlert("success", "Saved");
                },
                err => this.alert.addAlert("danger", "Error, unable to save")
            );
    }

    reloadUser() {
        this.userService.getRemoteUser();
        this.userService.getPromise().then(() => {
            if (this.userService.user.username) {
                this.hasQuota = this.userService.user.quota;
                this.orgCurator = this.userService.user.orgCurator.toString().replace(/,/g, ", ");
                this.orgAdmin = this.userService.user.orgAdmin.toString().replace(/,/g, ", ");
                this.user = this.userService.user;
            }
        });
    }

    removePublishedForm(pf) {
        this.user.publishedForms = this.user.publishedForms.filter(function (p: any) {
            return p._id !== pf._id;
        });
        this.saveProfile();
    }
}
