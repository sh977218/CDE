import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe, DatePipe, JsonPipe, NgForOf, NgIf, UpperCasePipe } from '@angular/common';
import { ItemLogResponse } from 'shared/log/audit';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { merge, Observable, of } from 'rxjs';
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
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ignoredDiff, makeHumanReadable } from './cdeDiffPopulate.service';
import { NgxTextDiffModule } from 'ngx-text-diff';
import { EltLog } from 'shared/models.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'cde-item-log',
    templateUrl: './item-log.component.html',
    styleUrls: ['./item-log.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
    imports: [
        MatTableModule,
        MatIconModule,
        NgForOf,
        NgIf,
        MatPaginatorModule,
        MatSortModule,
        AsyncPipe,
        MatButtonModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        DatePipe,
        JsonPipe,
        NgxTextDiffModule,
        MatProgressSpinnerModule,
        UpperCasePipe,
    ],
    standalone: true,
})
export class ItemLogComponent implements AfterViewInit {
    @Input() module = 'de';
    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    searchCriteria = new FormGroup(
        {
            includeBatchLoader: new FormControl<boolean>(false),
        },
        { updateOn: 'submit' }
    );

    resultsLength = 0;
    isLoadingResults = false;

    dataSource$: Observable<EltLog[]> = new Observable<EltLog[]>();
    columnsToDisplay = ['date', 'adminItem.name', 'user.username'];
    columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
    expandedElement: EltLog | null = null;

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
            includeBatchLoader: this.searchCriteria.get('includeBatchLoader')?.value,
            sortBy: this.sort.active,
            sortDir: this.sort.direction,
            currentPage: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
        };
        return this._httpClient.post<ItemLogResponse>(`/server/log/itemLog/${this.module}`, body).pipe(
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
            map(data => {
                data.forEach(rec => {
                    if (rec.diff) {
                        rec.diff.forEach(d => makeHumanReadable(d));
                    }
                });
                return data;
            }),
            catchError(() => of([]))
        );
    }

    protected readonly ignoredDiff = ignoredDiff;
}
