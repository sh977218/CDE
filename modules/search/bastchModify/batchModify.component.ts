import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ElasticService } from '_app/elastic.service';
import { AdminItemModule } from 'adminItem/adminItem.module';
import { AlertService } from 'alert/alert.service';
import { SearchModule } from 'search/search.module';
import { BatchModifyRequest } from 'shared/boundaryInterfaces/API/deAndForm';
import {
    AdministrativeStatus,
    administrativeStatuses,
    ClassificationClassified,
    curationStatus,
    CurationStatus,
    ModuleItem,
} from 'shared/models.model';
import { SearchSettings } from 'shared/search/search.model';

export interface BatchModifyDialogData {
    module: ModuleItem;
    searchSettings: SearchSettings;
    selectedCount: number;
}

@Component({
    templateUrl: './batchModify.component.html',
    styleUrls: ['./batchModify.component.scss'],
    standalone: true,
    imports: [AsyncPipe, NgIf, NgForOf, FormsModule, MatIconModule, AdminItemModule, SearchModule],
})
export class BatchModifyComponent {
    addClassification: ClassificationClassified[] = [];
    administrativeStatuses = administrativeStatuses;
    adminStatusTo?: AdministrativeStatus[];
    editAdminStatus?: { from: AdministrativeStatus; to?: AdministrativeStatus };
    editRegStatus?: { from: CurationStatus; to?: CurationStatus };
    isProcessing: boolean = false;
    isReview: boolean = false;
    regStatus = curationStatus;
    regStatusTo?: CurationStatus[];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: BatchModifyDialogData,
        private alert: AlertService,
        private elasticService: ElasticService,
        private http: HttpClient,
        public dialogRef: MatDialogRef<BatchModifyComponent>
    ) {}

    changeAdminStatus() {
        this.editAdminStatus = { from: this.data.searchSettings.adminStatuses[0] };
        this.updateAdminStatusToList();
    }

    changeRegStatus() {
        this.editRegStatus = { from: this.data.searchSettings.regStatuses[0] };
        this.updateRegStatusToList();
    }

    process() {
        this.isProcessing = true;
        this.http
            .post<string[]>(`/server/${this.data.module === 'cde' ? 'de' : 'form'}/batchModify`, {
                searchSettings: this.elasticService.buildElasticQuerySettings(this.data.searchSettings),
                count: this.data.selectedCount,
                editAdminStatus: this.editAdminStatus,
                editRegStatus: this.editRegStatus,
            } as BatchModifyRequest)
            .subscribe(
                notModified => {
                    this.dialogRef.close();
                    if (!notModified || notModified.length === 0) {
                        this.alert.addAlert('success', 'Batch Modification finished');
                    } else {
                        this.alert.addAlert('danger', 'Batch Modifications not complete: ' + notModified.join(', '));
                    }
                },
                err => {}
            );
    }

    review() {
        this.isReview = true;
    }

    updateAdminStatusToList() {
        this.adminStatusTo = this.editAdminStatus?.from
            ? this.administrativeStatuses.filter(s => s !== this.editAdminStatus?.from)
            : [];
        if (this.editAdminStatus?.to && !this.adminStatusTo.includes(this.editAdminStatus?.to)) {
            this.editAdminStatus.to = undefined;
        }
    }

    updateRegStatusToList() {
        this.regStatusTo = this.editRegStatus?.from
            ? this.regStatus.filter(reg => reg !== this.editRegStatus?.from)
            : [];
        if (this.editRegStatus?.to && !this.regStatusTo.includes(this.editRegStatus.to)) {
            this.editRegStatus.to = undefined;
        }
    }
}
