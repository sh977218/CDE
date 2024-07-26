import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { MeshSyncService } from 'settings/mesh-mapping/meshSync.service';
import {
    ConfirmReindexModalComponent,
    ConfirmReindexModalData,
    ConfirmReindexModalOutput,
} from 'settings/serverStatus/confirm-reindex-modal/confirm-reindex-modal.component';

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
    esIndices!: { name: string; indexName: string; count: number; totalCount: number }[];
    indexToReindex!: number;
    isDone: boolean = false;
    linkedForms: { total: number; done: number } = { total: 0, done: 0 };
    statuses: any[] = [];
    esInfo$;

    constructor(
        private http: HttpClient,
        private alert: AlertService,
        public dialog: MatDialog,
        public meshSync: MeshSyncService
    ) {
        this.refreshStatus();
        this.esInfo$ = http.get(`/server/system/esVersion`);
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

    openConfirmReindexModal(index: number) {
        this.esIndices[index].count = 0;
        const options: ConfirmReindexModalData['options'] = {};
        this.dialog
            .open<ConfirmReindexModalComponent, ConfirmReindexModalData, ConfirmReindexModalOutput>(
                ConfirmReindexModalComponent,
                {
                    width: '800px',
                    data: {
                        index,
                        indexName: this.esIndices[index].indexName,
                        options,
                    },
                }
            )
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

    syncLinkedFormWithCdeTinyId(tinyId: string) {
        this.http.post('/server/syncLinkedFormWithTinyId', { tinyId }).subscribe(
            (res: any) => {
                this.alert.addAlert('success', 'done indexing ' + tinyId);
            },
            err => this.alert.addAlert('danger', err)
        );
    }
}
