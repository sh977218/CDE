import { Component, Input, ViewChild, OnInit, Output, EventEmitter, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { DataElement } from 'shared/de/dataElement.model';
import { Property } from 'shared/models.model';
import { noop } from 'shared/util';

@Component({
    selector: 'cde-properties',
    templateUrl: './properties.component.html',
})
export class PropertiesComponent implements OnInit {
    @Input() canEdit = false;
    @Input() elt!: DataElement & {properties: {edit?: boolean}[]};
    @Output() eltChange = new EventEmitter();
    @ViewChild('newPropertyContent', {static: true}) newPropertyContent!: TemplateRef<any>;
    newProperty: Property = new Property();
    onInitDone = false;
    orgPropertyKeys: string[] = [];

    constructor(
        private alert: AlertService,
        public dialog: MatDialog,
        private orgHelperService: OrgHelperService,
    ) {
    }

    ngOnInit() {
        this.orgHelperService.then(orgsDetailedInfo => {
            if (this.elt.stewardOrg.name) {
                this.orgPropertyKeys = orgsDetailedInfo[this.elt.stewardOrg.name]?.propertyKeys || [];
            }
            this.onInitDone = true;
        }, noop);
    }

    openNewPropertyModal() {
        if (this.orgPropertyKeys.length === 0) {
            this.alert.addAlert('danger',
                'No valid property keys present, have an Org Admin go to Org Management > List Management to add one');
        } else {
            this.dialog.open(this.newPropertyContent).afterClosed().subscribe(res => {
                if (res) {
                    this.elt.properties.push(this.newProperty);
                    this.eltChange.emit();
                }
                this.newProperty = new Property();
            });
        }
    }

    removePropertyByIndex(index: number) {
        this.elt.properties.splice(index, 1);
        this.eltChange.emit();
    }
}
