import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { CdeForm } from 'shared/form/form.model';
import { supportedFhirResources, supportedFhirResourcesArray } from 'shared/mapping/fhir/fhirResource.model';
import { noop } from 'shared/util';

@Component({
    selector: 'cde-form-general-details[elt]',
    templateUrl: './formGeneralDetails.component.html'
})
export class FormGeneralDetailsComponent {
    @Input() set elt(e: CdeForm) {
        this._elt = e;
        this.tagFhirResource = e.mapTo && e.mapTo.fhir
            ? e.mapTo.fhir.resourceType || 'Default Mapping'
            : 'Not Mapped';
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
    supportedFhirResourcesArray = supportedFhirResourcesArray;
    tagFhirResource!: 'Not Mapped'|'Default Mapping'|supportedFhirResources;
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

    updateTagFhir() {
        if (this.tagFhirResource === 'Not Mapped') {
            if (this.elt.mapTo) {
                this.elt.mapTo.fhir = undefined;
                let count = 0;
                for (const m in this.elt.mapTo) {
                    if (m) { count++; }
                }
                if (!count) {
                    this.elt.mapTo = undefined;
                }
            }
        } else {
            if (!this.elt.mapTo) {
                this.elt.mapTo = {};
            }
            if (!this.elt.mapTo.fhir) {
                this.elt.mapTo.fhir = {};
            }
            this.elt.mapTo.fhir.resourceType = this.tagFhirResource === 'Default Mapping' ? undefined : this.tagFhirResource;
        }
        this.eltChange.emit();
    }
}
