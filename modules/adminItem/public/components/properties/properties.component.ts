import { Component, Input, ViewChild, OnInit, Output, EventEmitter, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AlertService } from 'alert/alert.service';
import { OrgHelperService } from 'core/orgHelper.service';
import _noop from 'lodash/noop';
import { DataElement } from 'shared/de/dataElement.model';
import { Property } from 'shared/models.model';

@Component({
    selector: 'cde-properties',
    templateUrl: './properties.component.html',
    styles: [`
        :host ::ng-deep #propertiesDiv table{
            width: 100%;
            max-width: 100%;
            margin-bottom: 1rem;
            background-color: transparent;
        }
        :host ::ng-deep #propertiesDiv table tbody tr:nth-of-type(odd){
            background-color: rgba(0, 0, 0, 0.05);
        }
        `]
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
    ) {
    }

    ngOnInit() {
        this.orgHelperService.then(orgsDetailedInfo => {
            this.orgPropertyKeys = orgsDetailedInfo[this.elt.stewardOrg.name].propertyKeys;
            this.onInitDone = true;
        }, _noop);
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
