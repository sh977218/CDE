import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, NgIf } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ActiveBan, ActiveBanResponse } from 'shared/log/audit';

@Component({
    selector: 'cde-active-ban',
    templateUrl: './active-ban.component.html',
    styleUrls: ['./active-ban.component.scss'],
    imports: [
        NgIf,
        MatProgressSpinnerModule,
        MatTableModule,
        MatSortModule,
        MatIconModule,
        DatePipe,
        MatPaginatorModule,
        MatButtonModule,
    ],
    standalone: true,
})
export class ActiveBanComponent {
    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;

    displayedColumns: string[] = ['date', 'ip', 'strikes', 'reason'];

    resultsLength = 0;
    isLoadingResults = false;

    dataSource = new MatTableDataSource<ActiveBan>([]);

    constructor(private _httpClient: HttpClient) {
        this.generateReport();
    }

    generateReport() {
        this.isLoadingResults = true;
        this._httpClient
            .get<ActiveBanResponse>(`/server/system/activeBans`)
            .pipe(
                tap({
                    complete: () => (this.isLoadingResults = false),
                }),
                map(res => {
                    return res.ipList || [];
                }),
                catchError(() => of([]))
            )
            .subscribe(res => {
                this.dataSource = new MatTableDataSource<ActiveBan>(res);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            });
    }

    remove(ip: string) {
        this._httpClient.post('/server/system/removeBan', { ip }).subscribe(() => this.generateReport());
    }
}
