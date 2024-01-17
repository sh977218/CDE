import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { differenceInDays } from 'date-fns';
import { DailyUsage } from 'shared/log/audit';

type Username = { _id: string; username: string };

type DailyUsageUI = DailyUsage & {
    usernames: string[] | null;
    daysAgo: number;
};

@Component({
    selector: 'cde-daily-usage',
    templateUrl: './daily-usage.component.html',
    styleUrls: ['./daily-usage.component.scss'],
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
export class DailyUsageComponent {
    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    numberOfDays = new FormControl<number>(3, { updateOn: 'submit' });

    displayedColumns: string[] = ['daysAgo', 'latestDate', 'hits', '_id', 'usernames'];

    resultsLength = 0;
    isLoadingResults = false;

    dataSource = new MatTableDataSource<DailyUsageUI>([]);

    constructor(private _httpClient: HttpClient) {}

    generateReport() {
        this.isLoadingResults = true;
        this._httpClient
            .get<DailyUsageUI[]>(`/server/log/dailyUsageReportLogs/${this.numberOfDays.value}`)
            .pipe(
                tap({
                    complete: () => (this.isLoadingResults = false),
                }),
                map(res => {
                    res.forEach(record => {
                        record.usernames = null;
                        const pastDate = new Date(record._id.year, record._id.month, record._id.day);
                        record.daysAgo = differenceInDays(pastDate, new Date());
                    });
                    res.sort((u1, u2) => u2.daysAgo - u1.daysAgo);
                    return res || [];
                }),
                catchError(() => of([]))
            )
            .subscribe(res => {
                this.dataSource = new MatTableDataSource<DailyUsageUI>(res);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            });
    }

    lookupUsername(dailyUsage: DailyUsage) {
        const ipToBeLookedUp = dailyUsage._id.ip;
        this._httpClient
            .get<Username[]>(`/server/siteAdmin/usernamesByIp/${ipToBeLookedUp}`)
            .pipe(
                map(res => {
                    return res.length ? res : [{ username: 'Anonymous' }];
                })
            )
            .subscribe(usernames => {
                this.dataSource.data.forEach(d => {
                    if (d._id.ip === ipToBeLookedUp) {
                        d.usernames = usernames.map(u => u.username);
                    }
                });
            });
    }
}
