import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { CdeForm } from 'shared/form/form.model';
import { noop } from 'shared/util';

@Component({
    selector: 'cde-form-general-details[elt]',
    templateUrl: './formGeneralDetails.component.html'
})
export class FormGeneralDetailsComponent {
    @Input() set elt(e: CdeForm) {
        this._elt = e;
    }

    get elt() {
        return this._elt;
    }

    @Input() canEdit = false;
    @Output() eltChange = new EventEmitter();
    private _elt!: CdeForm;
    options = {
        multiple: false,
        tags: true
    };
    userOrgs: string[] = [];

    constructor(public orgHelperService: OrgHelperService,
                public userService: UserService) {
        this.userService.then(() => {
            this.userOrgs = this.userService.userOrgs;
        }, noop);
    }

    changeStewardOrg(event: string) {
        this.elt.stewardOrg.name = event;
        this.eltChange.emit();
    }

}
