import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogData } from 'classificationManagement/dialog-data';
import { MatInputModule } from '@angular/material/input';
import { NgForOf, NgIf } from '@angular/common';
import { empty, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { ElasticQueryResponse } from 'shared/models.model';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../alert/alert.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'map-mesh-classification-dialog',
    templateUrl: './map-mesh-classification-dialog.component.html',
    imports: [
        MatDialogModule,
        MatInputModule,
        ReactiveFormsModule,
        NgIf,
        FormsModule,
        NgForOf,
        MatIconModule,
        MatButtonModule,
    ],
    standalone: true,
})
export class MapMeshClassificationDialogComponent {
    searching = false;
    private searchTerms = new Subject<string>();

    descriptorID!: string;
    descriptorName!: string;
    descToName: { [descId: string]: string } = {};

    mapping!: {
        flatClassification: string;
        meshDescriptors: string[];
    };
    meshSearchTerm = '';
    constructor(
        private http: HttpClient,
        public dialogRef: MatDialogRef<MapMeshClassificationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private alert: AlertService
    ) {
        this.searchTerms
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                tap(() => {
                    this.searching = true;
                    this.descriptorName = '';
                    this.descriptorID = '';
                }),
                switchMap(term => {
                    const url =
                        'https://meshb.nlm.nih.gov/api/search/record?searchInField=termDescriptor&searchType=exactMatch&q=' +
                        term;
                    return term ? this.http.get<ElasticQueryResponse<any>>(url) : empty();
                })
            )
            .subscribe(
                (res: any) => {
                    if (res && res.hits && res.hits.hits && res.hits.hits.length === 1) {
                        const desc = res.hits.hits[0]._source;
                        this.descriptorName = desc.DescriptorName.String.t;
                        this.descriptorID = desc.DescriptorUI.t;
                    }
                    this.searching = false;
                },
                err => {
                    this.searching = false;
                    this.descriptorName = '';
                    this.descriptorID = '';
                    this.alert.addAlert('danger', 'Unexpected error getting classification');
                }
            );
    }

    addMeshDescriptor() {
        this.mapping.meshDescriptors.push(this.descriptorID);
        this.descToName[this.descriptorID] = this.descriptorName;
        this.descriptorID = '';
        this.descriptorName = '';
        this.http.post<any>('/server/mesh/meshClassification', this.mapping).subscribe(
            res => {
                this.alert.addAlert('success', 'Saved');
                this.mapping = res;
            },
            () => this.alert.addAlert('danger', 'There was an issue saving this record.')
        );
    }

    removeDescriptor(i: number) {
        this.mapping.meshDescriptors.splice(i, 1);
        this.http.post<any>('/server/mesh/meshClassification', this.mapping).subscribe(
            res => {
                this.alert.addAlert('success', 'Saved');
                this.mapping = res;
            },
            () => this.alert.addAlert('danger', 'There was an issue saving this record.')
        );
    }

    searchMesh() {
        this.searchTerms.next(this.meshSearchTerm);
    }
}
