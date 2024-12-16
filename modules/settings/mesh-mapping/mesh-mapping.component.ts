import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AlertService } from 'alert/alert.service';
import { fileInputToFormData } from 'non-core/browser';
import { MeshSyncService } from 'settings/mesh-mapping/meshSync.service';
import { XLS_SHEET_NAME } from 'shared/mesh/meshMappingFileConstants';

@Component({
    templateUrl: './mesh-mapping.component.html',
    imports: [MatIconModule, NgIf, MatInputModule, MatProgressBarModule, NgForOf],
    standalone: true,
})
export class MeshMappingComponent {
    confirmDelete: boolean = false;
    loading: boolean = false;
    readonly sheetName = XLS_SHEET_NAME;

    constructor(private http: HttpClient, private alert: AlertService, public meshSync: MeshSyncService) {}

    deleteMapping() {
        this.loading = true;
        this.http.post('/server/mesh/deleteMeshMapping', {}).subscribe(
            () => {
                this.loading = false;
                this.alert.addAlert('success', 'Mesh mapping deleted');
            },
            e => {
                this.loading = false;
                this.alert.addAlert('danger', `Mesh mapping delete failed. ErrorL: ${e}`);
            }
        );
    }

    onFileSelectedCsv(event: any) {
        this.loading = true;
        const formData = fileInputToFormData(event.srcElement as HTMLInputElement);
        if (formData) {
            this.http.post<[number, number]>('/server/mesh/updateMeshMappingCsv', formData).subscribe({
                next: ([rowsCount, dbCount]) => {
                    this.loading = false;
                    this.alert.addAlert('success', `Mesh mapping updated (rows=${rowsCount})(mappings=${dbCount})`);
                },
                error: e => {
                    this.loading = false;
                    this.alert.addAlert('danger', `Mesh mapping update failed. ErrorL: ${e}`);
                },
            });
        }
    }

    onFileSelectedXls(event: any) {
        this.loading = true;
        const formData = fileInputToFormData(event.srcElement as HTMLInputElement);
        if (formData) {
            this.http.post<[number, number]>('/server/mesh/updateMeshMappingXls', formData).subscribe({
                next: ([rowsCount, dbCount]) => {
                    this.loading = false;
                    this.alert.addAlert('success', `Mesh mapping updated (rows=${rowsCount})(mappings=${dbCount})`);
                },
                error: e => {
                    this.loading = false;
                    this.alert.addAlert('danger', `Mesh mapping update failed. ErrorL: ${e}`);
                },
            });
        }
    }
}
