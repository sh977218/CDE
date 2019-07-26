import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NewDesignationComponent } from 'adminItem/public/components/naming/designation/newDesignation.component';
import { NewDefinitionComponent } from 'adminItem/public/components/naming/definition/newDefinition.component';
import { OrgHelperService } from 'non-core/orgHelper.service';
import _noop from 'lodash/noop';
import _uniq from 'lodash/uniq';

@Component({
    selector: 'cde-naming',
    templateUrl: './naming.component.html'
})
export class NamingComponent implements OnInit {
    @Input() elt: any;
    @Input() canEdit = false;
    @Output() onEltChange = new EventEmitter();
    allTags = [];

    constructor(private orgHelperService: OrgHelperService,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        const stewardOrgName = this.elt.stewardOrg.name;
        this.orgHelperService.then(orgsDetailedInfo => {
            this.allTags = orgsDetailedInfo[stewardOrgName].nameTags;
        }, _noop);
    }

    removeDesignationByIndex(index) {
        this.elt.designations.splice(index, 1);
        this.onEltChange.emit();
    }

    removeDefinitionByIndex(index) {
        this.elt.definitions.splice(index, 1);
        this.onEltChange.emit();
    }

    openNewDesignationModal() {
        this.dialog.open(NewDesignationComponent, {data: {tags: this.allTags}})
            .afterClosed()
            .subscribe(newDesignation => {
                if (newDesignation) {
                    this.elt.designations.push(newDesignation);
                    this.onEltChange.emit();
                }
            });
    }

    openNewDefinitionModal() {
        this.dialog.open(NewDefinitionComponent, {data: {tags: this.allTags}})
            .afterClosed()
            .subscribe(newDefinition => {
                if (newDefinition) {
                    this.elt.definitions.push(newDefinition);
                    this.onEltChange.emit();
                }
            });
    }
}
