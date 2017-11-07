import { Component, EventEmitter, Input, Output } from "@angular/core";
import "rxjs/add/operator/map";
import { IsAllowedService } from 'core/isAllowed.service';
import { UserService } from '_app/user.service';
import { OrgHelperService } from 'core/orgHelper.service';

@Component({
    selector: "cde-de-general-details",
    templateUrl: "./deGeneralDetails.component.html"
})
export class DeGeneralDetailsComponent {
    @Input() elt: any;
    @Input() canEdit;
    @Output() onEltChange = new EventEmitter();
    userOrgs = [];

    constructor(public userService: UserService,
                public orgHelperService: OrgHelperService) {
        this.userService.then(() => this.userOrgs = this.userService.userOrgs);
    }

    changeStewardOrg(event) {
        this.elt.stewardOrg.name = event;
        this.onEltChange.emit();
    }
}