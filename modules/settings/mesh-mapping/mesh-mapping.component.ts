import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { fileInputToFormData } from '../../non-core/browser';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { AlertService } from '../../alert/alert.service';

@Component({
    templateUrl: './mesh-mapping.component.html',
    imports: [MatIconModule, NgIf, MatInputModule],
    standalone: true,
})
export class MeshMappingComponent {
    selectedFile: any = null;

    constructor(private http: HttpClient, private alert: AlertService) {}

    onFileSelected(event: any) {
        const formData = fileInputToFormData(event.srcElement as HTMLInputElement);
        if (formData) {
            this.http
                .post('/server/mesh/updateMeshMapping', formData, { responseType: 'text' })
                .pipe(
                    tap({
                        next: () => this.alert.addAlert('success', 'Mesh mapping updated'),
                        error: e => this.alert.addAlert('danger', `Mesh mapping update failed. ErrorL: ${e}`),
                    })
                )
                .subscribe();
        }
    }
}
