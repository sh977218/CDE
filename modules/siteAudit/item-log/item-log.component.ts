import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import {
    AsyncPipe,
    DatePipe,
    JsonPipe,
    KeyValuePipe,
    NgForOf,
    NgIf,
    NgTemplateOutlet,
    UpperCasePipe,
} from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxTextDiffModule } from '@winarg/ngx-text-diff';
import { CamelCaseToHumanPipe } from 'non-core/camelCaseToHuman.pipe';
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
import { ClassificationAuditLogElement, ItemLog, ItemLogResponse } from 'shared/log/audit';
import { ignoredDiff, makeHumanReadable } from 'siteAudit/item-log/cdeDiffPopulate.service';

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
        NgTemplateOutlet,
        CamelCaseToHumanPipe,
        KeyValuePipe,
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

    dataSource$: Observable<ItemLog[]> = new Observable<ItemLog[]>();
    columnsToDisplay = ['date', 'elementName', 'username'];
    columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
    expandedElement: ItemLog | null = null;

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
            map(res => {
                // Flip flag to show that loading has finished.
                if (res === null) {
                    return [];
                }
                this.resultsLength = res.totalItems;
                res.logs.forEach((log: any) => {
                    if (log.diff) {
                        log.diff.forEach((d: any) => {
                            try {
                                makeHumanReadable(d);
                            } catch (e) {
                                console.info(`error occurred in makeHumanReadable(d), with exception: ${e} \n d: ${d}`);
                            }
                        });
                    }
                    if (log.elements) {
                        log.elements.forEach((e: ClassificationAuditLogElement, i: number) => {
                            e.name = e.name || `Element ${++i}`;
                        });
                    }
                });
                return res.logs;
            }),
            tap({
                next: () => {
                    this.isLoadingResults = false;
                },
                complete: () => {
                    this.isLoadingResults = false;
                },
                error: err => {
                    this.isLoadingResults = false;
                },
            }),
            catchError(() => of([]))
        );
    }

    public orderByKey(a: any, b: any) {
        return a.key;
    }

    protected readonly ignoredDiff = ignoredDiff;
}
