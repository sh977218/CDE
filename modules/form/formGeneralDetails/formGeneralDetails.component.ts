import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { CdeForm } from 'shared/form/form.model';
import { canBundle } from 'shared/security/authorizationShared';
import { noop } from 'shared/util';
import { bundleCreate, bundleDestroy } from 'form/formServices';
import { FormViewComponent } from 'form/formView/formView.component';

@Component({
    selector: 'cde-form-general-details[elt]',
    templateUrl: './formGeneralDetails.component.html',
    styleUrls: ['./formGeneralDetails.component.scss'],
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
    @Output() eltReloaded = new EventEmitter<CdeForm>();
    private _elt!: CdeForm;
    canBundle = canBundle;
    options = {
        multiple: false,
        tags: true,
    };
    userOrgs: string[] = [];

    constructor(
        private formViewComponent: FormViewComponent,
        public orgHelperService: OrgHelperService,
        public userService: UserService
    ) {
        this.userService.then(() => {
            this.userOrgs = this.userService.userOrgs;
        }, noop);
    }

    changeStewardOrg(event: string) {
        this.elt.stewardOrg.name = event;
        this.eltChange.emit();
    }

    bundle(form: CdeForm) {
        bundleCreate(form.tinyId).then(elt => this.eltReloaded.emit(elt));
    }

    unbundle(form: CdeForm) {
        bundleDestroy(form.tinyId).then(elt => this.eltReloaded.emit(elt));
    }

    trackByUrl(index, url) {
        return url.url;
    }
}
