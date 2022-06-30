import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { DataElement } from 'shared/de/dataElement.model';
import { AddPropertyModalComponent } from 'adminItem/properties/add-property-modal/add-property-modal.component';
import { noop } from 'shared/util';
import { OrgHelperService } from 'non-core/orgHelper.service';

@Component({
    selector: 'cde-properties',
    templateUrl: './properties.component.html',
})
export class PropertiesComponent {
    @Input() canEdit = false;
    @Input() elt!: DataElement & { properties: { edit?: boolean }[] };
    @Output() eltChange = new EventEmitter();
    orgPropertyKeys: string[] = [];

    constructor(public dialog: MatDialog,
                private alert: AlertService,
                private orgHelperService: OrgHelperService) {
        this.orgHelperService.then(orgsDetailedInfo => {
            if (this.elt.stewardOrg.name) {
                this.orgPropertyKeys = orgsDetailedInfo[this.elt.stewardOrg.name]?.propertyKeys || [];
            }
        }, noop);
    }

    openNewPropertyModal() {
        if (this.orgPropertyKeys.length === 0) {
            this.alert.addAlert('danger',
                'No valid property keys present, have an Org Admin go to Org Management > List Management to add one');
        } else {
            const data = this.orgPropertyKeys;
            this.dialog.open(AddPropertyModalComponent, {width: '800px', data})
                .afterClosed()
                .subscribe(newProperty => {
                    if (newProperty) {
                        this.elt.properties.push(newProperty);
                        this.eltChange.emit();
                    }
                });
        }
    }

    removePropertyByIndex(index: number) {
        this.elt.properties.splice(index, 1);
        this.eltChange.emit();
    }
}
