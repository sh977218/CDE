import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NewDesignationComponent } from 'adminItem/public/components/naming/designation/newDesignation.component';
import { NewDefinitionComponent } from 'adminItem/public/components/naming/definition/newDefinition.component';
import { OrgHelperService } from 'core/orgHelper.service';
import _noop from 'lodash/noop';
import _uniq from 'lodash/uniq';

@Component({
    selector: 'cde-naming',
    templateUrl: './naming.component.html'
})
export class NamingComponent implements OnInit {
    @Input() elt: any;
    @Input() canEdit: boolean = false;
    @Output() onEltChange = new EventEmitter();
    tags = [];

    constructor(private orgHelperService: OrgHelperService,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        let stewardOrgName = this.elt.stewardOrg.name;
        this.orgHelperService.then(orgsDetailedInfo => {
            let namingTags = orgsDetailedInfo[stewardOrgName].nameTags;
            let allNamingTags = this.elt.designations.reduce(
                (accumulator, currentValue) => accumulator.concat(currentValue.tags), namingTags);
            this.tags = _uniq(allNamingTags);
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
