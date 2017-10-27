import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";
import { UserService } from 'core/user.service';
import { OrgHelperService } from 'core/orgHelper.service';

@Component({
    selector: "cde-form-general-details",
    templateUrl: "./formGeneralDetails.component.html"
})
export class FormGeneralDetailsComponent {
    @Input() elt: any;
    @Input() canEdit: boolean = false;
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

    changeStewardOrg(event) {
        this.elt.stewardOrg.name = event;
        this.onEltChange.emit();
    }

}