import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";
import "rxjs/add/operator/map";
import { OrgHelperService } from "../../../../core/public/orgHelper.service";
import { UserService } from "../../../../core/public/user.service";

@Component({
    selector: "cde-de-general-details",
    templateUrl: "./deGeneralDetails.component.html"
})
export class DeGeneralDetailsComponent {

    constructor(@Inject("isAllowedModel") public isAllowedModel,
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