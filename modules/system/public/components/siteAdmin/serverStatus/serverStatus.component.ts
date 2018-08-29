import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '_app/alert.service';

@Component({
    selector: 'cde-server-status',
    templateUrl: './serverStatus.component.html'
})
export class ServerStatusComponent {
    @ViewChild('confirmReindex') confirmReindex!: NgbModalModule;
    esIndices: any;
    indexToReindex?: number;
    isDone: boolean = false;
    meshSyncs: any;
    statuses: any[] = [];

    constructor(
        private Alert: AlertService,
        private http: HttpClient,
        public modalService: NgbModal,
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
        this.http.get<any>('/serverStatuses').subscribe(result => {
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
        this.modalService.open(this.confirmReindex);
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
            }, err => this.Alert.addAlert('danger', err));
        }, 1000);
    }
}
