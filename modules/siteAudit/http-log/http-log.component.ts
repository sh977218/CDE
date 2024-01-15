import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { catchError, map, pairwise, startWith, switchMap, tap } from 'rxjs/operators';
import { merge, Observable, of } from 'rxjs';
import { HttpLog, HttpLogResponse } from 'shared/log/audit';

@Component({
    selector: 'cde-http-log',
    templateUrl: './http-log.component.html',
    styleUrls: ['./http-log.component.scss'],
    imports: [
        DatePipe,
        NgIf,
        NgForOf,
        FormsModule,
        ReactiveFormsModule,
        MatPaginatorModule,
        MatButtonModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSortModule,
        MatTableModule,
        AsyncPipe,
    ],
    standalone: true,
})
export class HttpLogComponent implements AfterViewInit {
    searchCriteria = new FormGroup(
        {
            start: new FormControl<Date | null>(null),
            end: new FormControl<Date | null>(null),
            filterTerm: new FormControl<string | null>(null),
        },
        { updateOn: 'submit' }
    );

    displayedColumns: string[] = [
        'date',
        'httpStatus',
        'level',
        'method',
        'referrer',
        'remoteAddr',
        'responseTime',
        'url',
    ];

    resultsLength = 0;
    isLoadingResults = true;

    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    dataSource$: Observable<HttpLog[]> = new Observable<HttpLog[]>();

    constructor(private _httpClient: HttpClient) {}

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
        this.dataSource$ = merge(
            this.searchCriteria.valueChanges.pipe(
                startWith(null),
                pairwise(),
                tap({
                    next: () => {
                        this.paginator.firstPage();
                        this.sort.sort({ id: 'date', start: 'desc', disableClear: true });
                    },
                })
            ),
            this.paginator.page,
            this.sort.sortChange
        ).pipe(
            tap({ next: () => (this.isLoadingResults = true) }),
            startWith({}),
            switchMap(() => this.searchLogs())
        );
    }

    onSubmit() {
        this.searchCriteria.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }

    onClear() {
        this.searchCriteria.get('filterTerm')?.reset('', { emitEvent: false });
    }

    searchLogs() {
        const body = {
            filterTerm: this.searchCriteria.get('filterTerm')?.value,
            fromDate: this.searchCriteria.get('start')?.value,
            toDate: this.searchCriteria.get('end')?.value,
            sortBy: this.sort.active,
            sortDir: this.sort.direction,
            currentPage: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
        };
        return this._httpClient.post<HttpLogResponse>('/server/log/httpLogs', body).pipe(
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
