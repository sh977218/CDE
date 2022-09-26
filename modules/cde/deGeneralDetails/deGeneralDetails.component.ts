import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { DataElement } from 'shared/de/dataElement.model';
import { noop } from 'shared/util';

@Component({
    selector: 'cde-de-general-details[elt]',
    templateUrl: './deGeneralDetails.component.html',
    styleUrls: ['./deGeneralDetails.component.scss'],
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
        }, noop);
    }

    changeStewardOrg(event: string) {
        this.elt.stewardOrg.name = event;
        this.eltChange.emit();
    }

    getQuestionText() {
        let designations = this.elt.designations;

        return (
            designations.find(
                d => d.tags.indexOf('Preferred Question Text') > -1
            )?.designation ||
            designations.find(d => d.tags.indexOf('Question Text') > -1)
                ?.designation ||
            'Submitter did not provide a Question Text'
        );
    }
}
