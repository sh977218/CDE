import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import { bundleCreate, bundleDestroy } from 'form/formServices';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { CdeForm, CopyrightURL } from 'shared/form/form.model';
import { canBundle } from 'shared/security/authorizationShared';

@Component({
    selector: 'cde-form-general-details[elt]',
    templateUrl: './formGeneralDetails.component.html',
    styleUrls: ['./formGeneralDetails.component.scss'],
})
export class FormGeneralDetailsComponent implements OnDestroy {
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
    unsubscribeUser?: () => void;
    userOrgs: string[] = [];

    constructor(public orgHelperService: OrgHelperService, public userService: UserService) {
        this.unsubscribeUser = this.userService.subscribe(() => {
            this.userOrgs = this.userService.userOrgs;
        });
    }

    ngOnDestroy() {
        if (this.unsubscribeUser) {
            this.unsubscribeUser();
            this.unsubscribeUser = undefined;
        }
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

    trackByUrl(index: number, url: CopyrightURL) {
        return url.url;
    }
}
