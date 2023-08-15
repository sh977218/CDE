import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-de-general-details[elt]',
    templateUrl: './deGeneralDetails.component.html',
    styleUrls: ['./deGeneralDetails.component.scss'],
})
export class DeGeneralDetailsComponent implements OnDestroy {
    @Input() canEdit: boolean = false;
    @Input() elt!: DataElement;
    @Output() eltChange = new EventEmitter();
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

    getQuestionText() {
        return (
            this.elt.designations.find(d => d.tags && d.tags.indexOf('Preferred Question Text') > -1)?.designation ||
            this.elt.designations.find(d => d.tags && d.tags.indexOf('Question Text') > -1)?.designation ||
            ''
        );
    }
}
