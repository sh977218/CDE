import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'cde-server-status',
    templateUrl: './serverStatus.component.html',
    styles: [
        `button {
            margin-top: 10px;
        }`
    ]
})
export class ServerStatusComponent {
    @ViewChild('confirmReindex') confirmReindex!: TemplateRef<any>;
    esIndices: any;
    indexToReindex?: number;
    isDone: boolean = false;
    meshSyncs: any;
    linkedForms: { total?: number, done?: number } = {};
    statuses: any[] = [];

    constructor(
        private Alert: AlertService,
        private http: HttpClient,
        public dialog: MatDialog,
    ) {
        this.refreshStatus();
    }

    okReIndex() {
        this.http.post('/reindex/' + this.indexToReindex, {}).subscribe(() => this.isDone = true);
        let indexFn = setInterval(() => {
            this.http.get<any>('indexCurrentNumDoc/' + this.indexToReindex).subscribe(response => {
                this.esIndices[this.indexToReindex!].count = response.count;
                this.esIndices[this.indexToReindex!].totalCount = response.totalCount;
                if (this.esIndices[this.indexToReindex!].count >= this.esIndices[this.indexToReindex!].totalCount && this.isDone) {
                    clearInterval(indexFn);
                    this.Alert.addAlert('success', 'Finished reindex ' + this.esIndices[this.indexToReindex!].name);
                    setTimeout(() => {
                        this.esIndices[this.indexToReindex!].count = 0;
                        this.esIndices[this.indexToReindex!].totalCount = 0;
                    }, 2000);
                }
            });
        }, 5000);
    }

    refreshStatus() {
        this.http.get<any>('/server/siteAdmin/serverStatuses').subscribe(result => {
            this.statuses = result.statuses;
            this.esIndices = result.esIndices;
            this.statuses.forEach(s => {
                s.allUp = s.elastic.up && s.elastic.indices.filter((ind: any) => ind.up).length === s.elastic.indices.length;
            });
        });
    }

    reIndex(i: number) {
        this.esIndices[i].count = 0;

        this.indexToReindex = i;
        this.dialog.open(this.confirmReindex);
    }

    syncMesh() {
        this.http.post('/server/mesh/syncWithMesh', {}).subscribe();
        let indexFn = setInterval(() => {
            this.http.get<any>('/server/mesh/syncWithMesh').subscribe(res => {
                this.meshSyncs = [];
                for (let p in res) {
                    if (res.hasOwnProperty(p)) this.meshSyncs.push(res[p]);
                }
                if (res.dataelement.done === res.dataelement.total
                    && res.form.done === res.form.total) {
                    clearInterval(indexFn);
                    this.Alert.addAlert('success', 'Done syncing');
                    this.meshSyncs = null;
                }
            }, () => this.Alert.addAlert('danger', "Unexpected error syncing"));
        }, 1000);
    }

    syncLinkedForms() {
        this.http.post('/syncLinkedForms', {}).subscribe();
        let indexFn = setInterval(() => {
            this.http.get<any>('/syncLinkedForms').subscribe(res => {
                this.linkedForms = res;
                if (res.done === res.total) {
                    clearInterval(indexFn);
                    this.Alert.addAlert('success', 'Done syncing');
                }
            }, () => this.Alert.addAlert('danger', "Unexpected error syncing"));
        }, 1000);
    }

}