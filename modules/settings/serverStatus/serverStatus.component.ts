import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmReindexModalComponent } from 'settings/serverStatus/confirm-reindex-modal/confirm-reindex-modal.component';

@Component({
    selector: 'cde-server-status',
    templateUrl: './serverStatus.component.html',
    styles: [
        `
            button {
                margin-top: 10px;
            }
        `,
    ],
})
export class ServerStatusComponent {
    esIndices: any;
    indexToReindex!: number;
    isDone: boolean = false;
    linkedForms: { total: number; done: number } = { total: 0, done: 0 };
    statuses: any[] = [];

    constructor(private alert: AlertService, private http: HttpClient, public dialog: MatDialog) {
        this.refreshStatus();
    }

    reIndex() {
        this.http.post('/server/system/reindex/' + this.indexToReindex, {}).subscribe(() => (this.isDone = true));
        const indexFn = setInterval(() => {
            this.http.get<any>('/server/system/indexCurrentNumDoc/' + this.indexToReindex).subscribe(response => {
                this.esIndices[this.indexToReindex].count = response.count;
                this.esIndices[this.indexToReindex].totalCount = response.totalCount;
                if (
                    this.esIndices[this.indexToReindex].count >= this.esIndices[this.indexToReindex].totalCount &&
                    this.isDone
                ) {
                    clearInterval(indexFn);
                    this.alert.addAlert('success', 'Finished reindex ' + this.esIndices[this.indexToReindex].name);
                    setTimeout(() => {
                        this.esIndices[this.indexToReindex].count = 0;
                        this.esIndices[this.indexToReindex].totalCount = 0;
                    }, 2000);
                }
            });
        }, 5000);
    }

    refreshStatus() {
        this.http.get<any>('/server/siteAdmin/serverStatuses').subscribe(result => {
            this.statuses = result.statuses;
            this.esIndices = result.esIndices;
            if (this.statuses) {
                this.statuses.forEach(s => {
                    s.allUp =
                        s.elastic.up &&
                        s.elastic.indices.filter((ind: any) => ind.up).length === s.elastic.indices.length;
                });
            }
        });
    }

    openConfirmReindexModal(index) {
        this.esIndices[index].count = 0;
        const data = {
            index,
            indexName: this.esIndices[index].indexName,
        };
        this.dialog
            .open(ConfirmReindexModalComponent, { width: '800px', data })
            .afterClosed()
            .subscribe(result => {
                if (result) {
                    this.indexToReindex = index;
                    this.reIndex();
                }
            });
    }

    syncLinkedForms() {
        this.http.post('/server/syncLinkedForms', {}).subscribe();
        const indexFn = setInterval(() => {
            this.http.get<any>('/server/syncLinkedForms').subscribe(
                res => {
                    this.linkedForms = res;
                    if (res.done === res.total) {
                        clearInterval(indexFn);
                        this.alert.addAlert('success', 'Done syncing');
                    }
                },
                () => this.alert.addAlert('danger', 'Unexpected error syncing')
            );
        }, 1000);
    }

    syncLinkedFormWithCdeTinyId(tinyId) {
        this.http.post('/server/syncLinkedFormWithTinyId', { tinyId }).subscribe(
            (res: any) => {
                this.alert.addAlert('success', 'done indexing ' + tinyId);
            },
            err => this.alert.addAlert('danger', err)
        );
    }
}
