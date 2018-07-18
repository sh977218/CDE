import { Component, EventEmitter, Input, Output } from '@angular/core';
import _noop from 'lodash/noop';

import { UserService } from '_app/user.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { CdeForm } from 'shared/form/form.model';
import { isMappedTo } from 'shared/form/formAndFe';
import { MatDialog } from '@angular/material';
import { FhirProcedureMappingComponent } from 'form/public/components/fhir/fhirProcedureMapping.component';

@Component({
    selector: 'cde-form-general-details',
    templateUrl: './formGeneralDetails.component.html'
})
export class FormGeneralDetailsComponent {
    @Input() set elt(e: CdeForm) {
        this._elt = e;
        this.tagFhirResource = isMappedTo(e, 'fhir') ? e.mapTo.fhir.resourceType || 'Default Mapping' : 'Not Mapped';
    }
    get elt() {
        return this._elt;
    }
    @Input() canEdit: boolean = false;
    @Output() onEltChange = new EventEmitter();
    private _elt: CdeForm;
    options = {
        multiple: false,
        tags: true
    };
    tagFhirResource: string;
    userOrgs = [];

    constructor(public dialog: MatDialog,
                public userService: UserService,
                public orgHelperService: OrgHelperService) {
        this.userService.then(() => {
            this.userOrgs = this.userService.userOrgs;
        }, _noop);
    }

    changeStewardOrg(event) {
        this.elt.stewardOrg.name = event;
        this.onEltChange.emit();
    }

    updateTagFhir() {
        if (this.tagFhirResource === 'Not Mapped') {
            if (this.elt.mapTo) {
                this.elt.mapTo.fhir = undefined;
                let count = 0;
                for (let m in this.elt.mapTo) {
                    if (m) count++;
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
        this.onEltChange.emit();
    }


    openProcedureMapping() {
        let dialogRef = this.dialog.open(FhirProcedureMappingComponent, {
            width: '550px',
            data: {
            }
        });
        dialogRef.componentInstance.onChanged.subscribe(() => {
            console.log("mapping changed");
        });
        dialogRef.componentInstance.onClosed.subscribe(() => dialogRef.close());
    }

}
