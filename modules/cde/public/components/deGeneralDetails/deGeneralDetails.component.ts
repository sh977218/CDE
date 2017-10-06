import { Component, EventEmitter, Input, Output } from "@angular/core";
import "rxjs/add/operator/map";
import { IsAllowedService } from 'core/public/isAllowed.service';
import { UserService } from 'core/public/user.service';
import { OrgHelperService } from 'core/public/orgHelper.service';

@Component({
    selector: "cde-de-general-details",
    templateUrl: "./deGeneralDetails.component.html"
})
export class DeGeneralDetailsComponent {
    @Input() elt: any;
    @Input() canEdit;
    @Output() onEltChange = new EventEmitter();
    userOrgs = [];
    options = {
        multiple: false,
        tags: true
    };

    constructor(public userService: UserService,
                public orgHelperService: OrgHelperService) {
        this.userService.then(() => this.userOrgs = this.userService.userOrgs);
    }
}