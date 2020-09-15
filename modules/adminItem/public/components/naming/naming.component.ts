import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

import { NewDesignationComponent } from 'adminItem/public/components/naming/designation/newDesignation.component';
import { NewDefinitionComponent } from 'adminItem/public/components/naming/definition/newDefinition.component';
import { OrgHelperService } from 'non-core/orgHelper.service';
import _noop from 'lodash/noop';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'cde-naming',
    templateUrl: './naming.component.html',
    styles: [`
        .namingDiv {
            overflow: hidden;
            overflow-y: auto;
            width: 100%;
            max-height: 400px;
        }
    `]
})
export class NamingComponent implements OnInit {
    @Input() elt: any;
    @Input() canEdit = false;
    @Output() eltChange = new EventEmitter();
    allTags: string[] = [];

    constructor(private orgHelperService: OrgHelperService,
                public dialog: MatDialog) {
    }

    ngOnInit() {
        const stewardOrgName = this.elt.stewardOrg.name;
        this.orgHelperService.then(orgsDetailedInfo => {
            this.allTags = orgsDetailedInfo[stewardOrgName]?.nameTags || [];
        }, _noop);
    }

    openNewDefinitionModal() {
        this.dialog.open(NewDefinitionComponent, {data: {tags: this.allTags}})
            .afterClosed()
            .subscribe(newDefinition => {
                if (newDefinition) {
                    this.elt.definitions.push(newDefinition);
                    this.eltChange.emit();
                }
            });
    }

    openNewDesignationModal() {
        this.dialog.open(NewDesignationComponent, {data: {tags: this.allTags}})
            .afterClosed()
            .subscribe(newDesignation => {
                if (newDesignation) {
                    this.elt.designations.push(newDesignation);
                    this.eltChange.emit();
                }
            });
    }

    removeDefinitionByIndex(index: number) {
        this.elt.definitions.splice(index, 1);
        this.eltChange.emit();
    }

    removeDesignationByIndex(index: number) {
        this.elt.designations.splice(index, 1);
        this.eltChange.emit();
    }
}
