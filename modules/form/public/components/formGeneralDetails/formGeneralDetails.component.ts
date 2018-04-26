import { Component, EventEmitter, Input, Output } from '@angular/core';
import _noop from 'lodash/noop';

import { UserService } from '_app/user.service';
import { OrgHelperService } from 'core/orgHelper.service';

@Component({
    selector: 'cde-form-general-details',
    templateUrl: './formGeneralDetails.component.html'
})
export class FormGeneralDetailsComponent {
    @Input() elt: any;
    @Input() canEdit: boolean = false;
    @Output() onEltChange = new EventEmitter();
    options = {
        multiple: false,
        tags: true
    };
    userOrgs = [];

    constructor(public userService: UserService,
                public orgHelperService: OrgHelperService) {
        this.userService.then(() => {
            this.userOrgs = this.userService.userOrgs;
        }, _noop);
    }

    changeStewardOrg(event) {
        this.elt.stewardOrg.name = event;
        this.onEltChange.emit();
    }
}
