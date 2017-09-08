import { Component, OnInit, Inject } from "@angular/core";
import { OrgHelperService } from "core/public/orgHelper.service";

@Component({
    selector: "cde-org-classification-management",
    templateUrl: "./orgClassificationManagement.component.html"
})
export class OrgClassificationManagementComponent implements OnInit {
    onInitDone: boolean = false;
    orgToManage;
    userOrgs;

    constructor(private orgHelperService: OrgHelperService,
                @Inject("userResource") private userService) {
    }

    ngOnInit(): void {
        this.userService.getPromise().then(() => {
            if (this.userService.userOrgs.length > 0) {
                this.orgToManage = this.userService.userOrgs[0];
            }
            this.onInitDone = true;
        });

    }

}