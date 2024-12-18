import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '_app/user.service';
import { RegistrationStatusModalComponent } from 'adminItem/registration/registration-status-modal/registration-status-modal.component';
import { AlertService } from 'alert/alert.service';
import { DataElement } from 'shared/de/dataElement.model';
import { Item } from 'shared/item';
import { AdministrativeStatus, administrativeStatuses, RegistrationState } from 'shared/models.model';

@Component({
    selector: 'cde-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss'],
    providers: [MatDialog],
})
export class RegistrationComponent implements OnInit {
    @Input() canEdit = false;
    @Input() elt!: Item;
    @Output() eltChange = new EventEmitter();
    @ViewChild('regStatusEdit', { static: true }) regStatusEditModal!: TemplateRef<any>;
    DataElement = DataElement;
    helpMessage?: string;
    newState!: RegistrationState;
    validRegStatuses: string[] = ['Retired', 'Incomplete', 'Candidate'];
    validAdminStatus: readonly AdministrativeStatus[] = administrativeStatuses;

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public dialog: MatDialog,
        public userService: UserService
    ) {}

    ngOnInit() {
        this.newState = {
            registrationStatus: this.elt.registrationState.registrationStatus,
            administrativeStatus: this.elt.registrationState.administrativeStatus,
        };
    }

    getViews(): number | undefined {
        return (this.elt as DataElement).views;
    }

    openRegStatusUpdate() {
        this.dialog
            .open(RegistrationStatusModalComponent, {
                width: '1000px',
                data: this.elt,
            })
            .afterClosed()
            .subscribe(registrationState => {
                if (registrationState) {
                    this.elt.registrationState = registrationState;
                    this.eltChange.emit();
                }
            });
    }
}
