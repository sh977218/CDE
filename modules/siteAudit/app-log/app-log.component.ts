import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
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
import { AppLog, AppLogResponse } from 'shared/log/audit';

@Component({
    selector: 'cde-app-log',
    templateUrl: './app-log.component.html',
    styleUrls: ['./app-log.component.scss'],
    imports: [
        MatInputModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatButtonModule,
        NgIf,
        MatProgressSpinnerModule,
        MatTableModule,
        MatSortModule,
        AsyncPipe,
        DatePipe,
        MatPaginatorModule,
    ],
    standalone: true,
})
export class AppLogComponent implements AfterViewInit {
    searchCriteria = new FormGroup(
        {
            start: new FormControl<Date | null>(null),
            end: new FormControl<Date | null>(null),
        },
        { updateOn: 'submit' }
    );

    displayedColumns: string[] = ['date', 'level', 'message'];

    resultsLength = 0;
    isLoadingResults = false;

    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    dataSource$: Observable<AppLog[]> = new Observable<AppLog[]>();

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
            fromDate: this.searchCriteria.get('start')?.value,
            toDate: this.searchCriteria.get('end')?.value,
            sortBy: this.sort.active,
            sortDir: this.sort.direction,
            currentPage: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
        };
        return this._httpClient.post<AppLogResponse>('/server/log/appLogs', body).pipe(
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
