import { Component, EventEmitter, Input, Output } from '@angular/core';
import _noop from 'lodash/noop';

import { UserService } from '_app/user.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { CdeForm } from 'shared/form/form.model';
import { deleteTag, getTag, newTag } from 'shared/form/formAndFe';

@Component({
    selector: 'cde-form-general-details',
    templateUrl: './formGeneralDetails.component.html'
})
export class FormGeneralDetailsComponent {
    @Input() set elt(e: CdeForm) {
        this._elt = e;
        let tag = getTag(e, 'fhir');
        this.tagFhir = !!tag;
        this.tagFhirResource = tag && tag.value ? tag.value.resourceType : undefined;
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
    tagFhir: boolean;
    tagFhirResource: string;
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

    updateTagFhir() {
        let tag = getTag(this.elt, 'fhir');
        if (this.tagFhir) {
            if (!tag) {
                tag = newTag(this.elt, 'fhir');
            }
            if (!tag.value) {
                tag.value = {};
            }
            tag.value.resourceType = this.tagFhirResource;
        } else {
            if (tag) {
                deleteTag(this.elt, tag);
            }
        }
        this.onEltChange.emit();
    }
}
