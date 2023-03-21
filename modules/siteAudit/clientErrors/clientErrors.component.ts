import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ClientErrorDetailModalComponent } from 'siteAudit/clientErrors/client-error-detail-modal/client-error-detail-modal.component';

@Component({
    selector: 'cde-client-errors',
    templateUrl: './clientErrors.component.html',
})
export class ClientErrorsComponent {
    currentPage: number = 0;
    records: any = [];
    filteredRecords = [];
    error;
    browserInclude: { [browser: string]: boolean } = {
        chrome: true,
        firefox: true,
        ie: false,
        edge: true,
    };

    constructor(private http: HttpClient, public dialog: MatDialog, private alert: AlertService) {
        this.gotoPage();
    }

    gotoPage(event?: PageEvent) {
        if (event) {
            this.currentPage = event.pageIndex;
        }

        this.http
            .post('/server/log/clientErrors', {
                skip: this.currentPage * 50,
                limit: 50,
            })
            .subscribe(
                response => {
                    this.records = response;
                    this.records.forEach(r => {
                        if (r.url) {
                            r.url = r.url.substr(8);
                            r.url = r.url.substr(r.url.indexOf('/'));
                        }
                    });
                    this.filter();
                },
                err => this.alert.httpErrorMessageAlert(err)
            );
    }

    openErrorDetailModal(error) {
        const data = error;
        this.dialog.open(ClientErrorDetailModalComponent, { width: '800px', data });
    }

    filter() {
        this.filteredRecords = this.records.filter(r => {
            try {
                return this.browserInclude[r.agent.substr(0, r.agent.indexOf(' ')).toLowerCase()];
            } catch (e) {
                return true;
            }
        });
    }
}
