import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { IdSource } from 'shared/models.model';
import { MatListModule } from '@angular/material/list';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject } from 'rxjs';
import { catchError, startWith, switchMap, tap } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'cde-id-sources',
    templateUrl: './idSources.component.html',
    styleUrls: ['./idSources.component.scss'],
    imports: [
        NgIf,
        NgForOf,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatListModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTableModule,
    ],
    standalone: true,
})
export class IdSourcesComponent {
    displayedColumns: string[] = ['_id', 'links', 'version'];

    isLoadingResults = true;

    reloadData = new Subject();

    newOrgName = new FormControl('', [Validators.required]);

    data$ = this.reloadData.pipe(
        startWith(true),
        switchMap(() =>
            this.http.get<IdSource[]>('/server/system/idSources').pipe(
                tap({
                    next: () => (this.isLoadingResults = false),
                    error: err => {
                        this.isLoadingResults = false;
                        this.alert.httpErrorAlert(err);
                    },
                    complete: () => (this.isLoadingResults = false),
                }),
                catchError(() => {
                    return [];
                })
            )
        )
    );

    constructor(private alert: AlertService, private http: HttpClient) {}

    add() {
        this.isLoadingResults = true;
        const newOrgName = this.newOrgName.value;
        this.http
            .post(`/server/system/idSource/${newOrgName}`, {})
            .pipe(
                tap({
                    next: () => {
                        this.reloadData.next(true);
                        this.alert.addAlert('success', `${newOrgName} added.`);
                        this.newOrgName.reset();
                    },
                    error: err => {
                        this.isLoadingResults = false;
                        this.alert.httpErrorAlert(err);
                    },
                })
            )
            .subscribe();
    }

    delete(source: IdSource) {
        this.isLoadingResults = true;
        this.http
            .delete('/server/system/idSource/' + source._id)
            .pipe(
                tap({
                    next: () => {
                        this.reloadData.next(true);
                        this.alert.addAlert('success', `${source._id} deleted.`);
                    },
                    error: err => {
                        this.isLoadingResults = false;
                        this.alert.httpErrorAlert(err);
                    },
                })
            )
            .subscribe();
    }

    update(source: IdSource) {
        this.isLoadingResults = true;
        this.http
            .put(`/server/system/idSource/${source._id}`, source)
            .pipe(
                tap({
                    next: () => {
                        this.reloadData.next(true);
                        this.alert.addAlert('success', `${source._id} updated.`);
                    },
                    error: err => {
                        this.isLoadingResults = false;
                        this.alert.httpErrorAlert(err);
                    },
                })
            )
            .subscribe();
    }
}
