import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe, DatePipe, JsonPipe, NgForOf, NgIf } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { ClientError, ClientErrorExtraInfo, ClientErrorResponse } from 'shared/log/audit';
import { ClientErrorDetailModalComponent } from './client-error-detail-modal/client-error-detail-modal.component';

export type ClientErrorUI = ClientError & ClientErrorExtraInfo;

@Component({
    selector: 'cde-client-error',
    templateUrl: './client-error.component.html',
    styleUrls: ['./client-error.component.scss'],
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
        MatCheckboxModule,
        JsonPipe,
        ClientErrorDetailModalComponent,
    ],
    standalone: true,
})
export class ClientErrorComponent implements AfterViewInit {
    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    searchCriteria;

    displayedColumns: string[] = ['date', 'userAgent', 'username', 'ip', 'stack', 'url'];

    resultsLength = 0;
    isLoadingResults = false;

    dataSource$: Observable<ClientErrorUI[]> = new Observable<ClientErrorUI[]>();

    constructor(private _httpClient: HttpClient, private _formBuilder: FormBuilder, public dialog: MatDialog) {
        this.searchCriteria = _formBuilder.group(
            {
                chrome: true,
                firefox: true,
                ie: true,
                safari: true,
            },
            { updateOn: 'submit' }
        );
    }

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
        const userAgents = this.searchCriteria.value;
        const selectedUserAgents = Object.keys(userAgents).filter(k => {
            const userAgent = userAgents[k as keyof typeof userAgents];
            return !!userAgent;
        });
        const body = {
            includeUserAgents: selectedUserAgents,
            sortBy: this.sort.active,
            sortDir: this.sort.direction,
            currentPage: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
        };
        return this._httpClient.post<ClientErrorResponse>('/server/log/clientErrors', body).pipe(
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
            map((data: ClientError[]): ClientErrorUI[] => {
                const result = data.map(d => {
                    const messageObj = JSON.parse(d.message);
                    return {
                        ...d,
                        stack: messageObj.stack,
                        url: messageObj.url,
                    };
                });
                return result;
            }),
            catchError(() => of([]))
        );
    }

    openErrorDetailModal(message: string) {
        this.dialog.open(ClientErrorDetailModalComponent, { width: '800px', data: message || '' });
    }
}
