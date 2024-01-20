import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, NgIf } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { LoginRecord, LoginRecordResponse } from 'shared/log/audit';

@Component({
    selector: 'cde-login-record',
    templateUrl: './login-record.component.html',
    styleUrls: ['./login-record.component.scss'],
    imports: [NgIf, MatProgressSpinnerModule, MatTableModule, MatSortModule, DatePipe, MatPaginatorModule],
    standalone: true,
})
export class LoginRecordComponent implements AfterViewInit {
    displayedColumns: string[] = ['date', 'user', 'email', 'ip'];
    data: LoginRecord[] = [];

    resultsLength = 0;
    isLoadingResults = true;

    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    constructor(private _httpClient: HttpClient) {}

    ngAfterViewInit() {
        // If the user changes the sort order, reset back to the first page.
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.isLoadingResults = true;
                    return this.searchLog().pipe(
                        tap({
                            complete: () => (this.isLoadingResults = false),
                        })
                    );
                }),
                map(data => {
                    // Flip flag to show that loading has finished.
                    this.isLoadingResults = false;

                    if (data === null) {
                        return [];
                    }

                    // Only refresh the result length if there is new data. In case of rate
                    // limit errors, we do not want to reset the paginator to zero, as that
                    // would prevent users from re-triggering requests.
                    this.resultsLength = data.totalItems;
                    return data.logs;
                })
            )
            .subscribe(data => (this.data = data));
    }

    searchLog() {
        const body = {
            sortBy: this.sort.active,
            sortDir: this.sort.direction,
            currentPage: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
        };
        return this._httpClient.post<LoginRecordResponse>(`/server/log/loginRecords`, body);
    }
}
