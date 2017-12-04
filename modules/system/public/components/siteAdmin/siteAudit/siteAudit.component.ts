import { Component } from "@angular/core";
import { UserService } from '_app/user.service';

@Component({
    selector: "cde-site-audit",
    templateUrl: "./siteAudit.component.html"
})

export class SiteAuditComponent  {

    constructor(public userService: UserService) {}

}