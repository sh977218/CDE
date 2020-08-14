import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import _noop from 'lodash/noop';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-de-general-details[elt]',
    templateUrl: './deGeneralDetails.component.html'
})
export class DeGeneralDetailsComponent {
    @Input() canEdit: boolean = false;
    @Input() elt!: DataElement;
    @Output() eltChange = new EventEmitter();
    userOrgs: string[] = [];

    constructor(
        public orgHelperService: OrgHelperService,
        public userService: UserService
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
