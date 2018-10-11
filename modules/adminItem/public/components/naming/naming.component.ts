import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import _uniq from 'lodash/uniq';

import { OrgHelperService } from 'core/orgHelper.service';
import { NewDesignationComponent } from 'adminItem/public/components/naming/designation/newDesignation.component';
import { NewDefinitionComponent } from 'adminItem/public/components/naming/definition/newDefinition.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'cde-naming',
    templateUrl: './naming.component.html'
})
export class NamingComponent implements OnInit {
    @Input() canEdit: boolean = false;
    @Input() elt: any;
    @Output() onEltChange = new EventEmitter();
    tags = [];

    constructor(public dialog: MatDialog,
                private orgHelperService: OrgHelperService) {
    }

    ngOnInit() {
        let stewardOrgName = this.elt.stewardOrg.name;
        let namingTags = this.orgHelperService.orgsDetailedInfo[stewardOrgName].nameTags;
        let allNamingTags = this.elt.designations.reduce((accumulator, currentValue) => {
            return accumulator.concat(currentValue.tags);
        }, namingTags);
        this.tags = _uniq(allNamingTags);
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
        this.dialog.open(NewDesignationComponent, {data: {tags: this.tags}}).afterClosed().subscribe(newDesignation => {
            if (newDesignation) {
                this.elt.designations.push(newDesignation);
                this.onEltChange.emit();
            }
        });
    }

    openNewDefinitionModal() {
        this.dialog.open(NewDefinitionComponent, {data: {tags: this.tags}}).afterClosed().subscribe(newDefinition => {
            if (newDefinition) {
                this.elt.definitions.push(newDefinition);
                this.onEltChange.emit();
            }
        });
    }
}
