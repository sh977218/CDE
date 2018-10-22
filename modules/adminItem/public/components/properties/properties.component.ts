import { Component, Input, ViewChild, OnInit, Output, EventEmitter, TemplateRef } from '@angular/core';

import { AlertService } from '_app/alert.service';
import { DataElement } from 'shared/de/dataElement.model';
import { Property } from 'shared/models.model';
import { OrgHelperService } from 'core/orgHelper.service';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'cde-properties',
    templateUrl: './properties.component.html'
})
export class PropertiesComponent implements OnInit {
    @Input() canEdit: boolean = false;
    @Input() elt: DataElement;
    @Output() onEltChange = new EventEmitter();
    @ViewChild('newPropertyContent') newPropertyContent: TemplateRef<any>;
    newProperty: Property = new Property();
    onInitDone: boolean = false;
    orgPropertyKeys: string[] = [];

    constructor(
        private alert: AlertService,
        public dialog: MatDialog,
        private orgHelperService: OrgHelperService,
    ) {}

    ngOnInit() {
        this.orgHelperService.reload().then(() => {
            this.orgPropertyKeys = this.orgHelperService.orgsDetailedInfo[this.elt.stewardOrg.name].propertyKeys;
            this.onInitDone = true;
        });
    }

    openNewPropertyModal() {
        if (this.orgPropertyKeys.length === 0) {
            this.alert.addAlert('danger', 'No valid property keys present, have an Org Admin go to Org Management > List Management to add one');
        } else {
            this.dialog.open(this.newPropertyContent).afterClosed().subscribe(res => {
                if (res) {
                    this.elt.properties.push(this.newProperty);
                    this.onEltChange.emit();
                }
                this.newProperty = new Property();
            });
        }
    }

    removePropertyByIndex(index) {
        this.elt.properties.splice(index, 1);
        this.onEltChange.emit();
    }

}
