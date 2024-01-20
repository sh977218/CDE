import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe, DatePipe, JsonPipe, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    map,
    pairwise,
    startWith,
    switchMap,
    tap,
} from 'rxjs/operators';
import { merge, Observable, of } from 'rxjs';
import { ServerError, ServerErrorResponse } from 'shared/log/audit';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'cde-server-error',
    templateUrl: './server-error.component.html',
    styleUrls: ['./server-error.component.scss'],
    imports: [
        ReactiveFormsModule,
        MatCheckboxModule,
        MatButtonModule,
        NgIf,
        MatProgressSpinnerModule,
        MatTableModule,
        MatSortModule,
        AsyncPipe,
        DatePipe,
        JsonPipe,
        MatPaginatorModule,
    ],
    standalone: true,
})
export class ServerErrorComponent implements AfterViewInit {
    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    searchCriteria = new FormGroup(
        {
            includeBadInput: new FormControl<boolean>(false),
        },
        { updateOn: 'submit' }
    );

    displayedColumns: string[] = ['date', 'request', 'stack', 'details', 'message', 'errorCode', 'errorType'];

    resultsLength = 0;
    isLoadingResults = false;

    dataSource$: Observable<ServerError[]> = new Observable<ServerError[]>();

    constructor(private _httpClient: HttpClient) {}

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
        this.dataSource$ = merge(
            this.paginator.page,
            this.sort.sortChange,
            this.searchCriteria.valueChanges.pipe(
                debounceTime(150),
                distinctUntilChanged(),
                startWith(null),
                pairwise(),
                tap({
                    next: () => this.paginator.firstPage(),
                })
            )
        ).pipe(
            tap({ next: () => (this.isLoadingResults = true) }),
            switchMap(() => this.searchLogs())
        );
    }

    onSubmit() {
        this.searchCriteria.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }

    searchLogs() {
        const body = {
            includeBadInput: this.searchCriteria.get('includeBadInput')?.value,
            sortBy: this.sort.active,
            sortDir: this.sort.direction,
            currentPage: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
        };
        return this._httpClient.post<ServerErrorResponse>('/server/log/serverErrors', body).pipe(
            tap({
                complete: () => (this.isLoadingResults = false),
            }),
            map(data => {
                // Flip flag to show that loading has finished.
                if (data === null) {
                    return [];
                }
                this.resultsLength = data.totalItems;
                return data.logs;
            }),
            catchError(() => of([]))
        );
    }
}
