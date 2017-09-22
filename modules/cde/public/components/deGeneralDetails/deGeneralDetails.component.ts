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

    constructor(public isAllowedModel: IsAllowedService,
                public userService: UserService,
                public orgHelperService: OrgHelperService) {
    }

    @Input() elt: any;
    @Output() save = new EventEmitter();

    editDtMode: boolean;

    saveDataElement() {
        this.save.emit();
    }
}