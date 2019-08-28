import { Component, EventEmitter, Input, Output } from '@angular/core';
import _noop from 'lodash/noop';

import { UserService } from '_app/user.service';
import { OrgHelperService } from 'non-core/orgHelper.service';


@Component({
    selector: 'cde-de-general-details',
    templateUrl: './deGeneralDetails.component.html'
})
export class DeGeneralDetailsComponent {
    @Input() canEdit: boolean = false;
    @Input() elt: any;
    @Output() eltChange = new EventEmitter();
    userOrgs: string[] = [];

    constructor(
        public userService: UserService,
        public orgHelperService: OrgHelperService
    ) {
        this.userService.then(() => {
            this.userOrgs = this.userService.userOrgs;
        }, _noop);
    }

    changeStewardOrg(event: string) {
        this.elt.stewardOrg.name = event;
        this.eltChange.emit();
    }
}
