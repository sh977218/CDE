import { Http } from "@angular/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../alert/alert.service";

@Component({
    selector: "cde-server-status",
    templateUrl: "./serverStatus.component.html"
})

export class ServerStatusComponent implements OnInit {

    constructor(private http: Http,
                public modalService: NgbModal,
                private Alert: AlertService) {}

    statuses: any[] = [];
    esIndices: any;
    meshSyncs: any;

    indexToReindex: number;
    isDone: boolean = false;

    @ViewChild("confirmReindex") public confirmReindex: NgbModalModule;

    ngOnInit() {
        this.refreshStatus();
    }

    refreshStatus  () {
        this.http.get("/serverStatuses").map(r => r.json()).subscribe(result => {
            this.statuses = result.statuses;
            this.esIndices = result.esIndices;
            this.statuses.forEach(s => {
                s.allUp = s.elastic.up && s.elastic.indices.filter(ind => ind.up).length === s.elastic.indices.length;
            });
        });
    }

    okReIndex () {
        this.http.post('/reindex/' + this.indexToReindex, {}).subscribe(() => this.isDone = true);
        let indexFn = setInterval(() => {
            this.http.get("indexCurrentNumDoc/" + this.indexToReindex).map(r => r.json()).subscribe(response => {
                this.esIndices[this.indexToReindex].count = response.count;
                this.esIndices[this.indexToReindex].totalCount = response.totalCount;
                if (this.esIndices[this.indexToReindex].count >= this.esIndices[this.indexToReindex].totalCount && this.isDone) {
                    clearInterval(indexFn);
                    this.Alert.addAlert("success", "Finished reindex " + this.esIndices[this.indexToReindex].name);
                    setTimeout(() => {
                        this.esIndices[this.indexToReindex].count = 0;
                        this.esIndices[this.indexToReindex].totalCount = 0;
                    }, 2000);
                }
            });
        }, 5000);
    };


    reIndex (i) {
        this.esIndices[i].count = 0;

        this.indexToReindex = i;
        this.modalService.open(this.confirmReindex);
    }

    syncMesh () {
        this.http.post("/syncWithMesh", {}).subscribe();
        let indexFn = setInterval(() => {
            this.http.get('/syncWithMesh').map(r => r.json()).subscribe(response => {
                this.meshSyncs = [];
                for (let p in response) {
                    if (response.hasOwnProperty(p))
                        this.meshSyncs.push(response[p]);
                }
                if (response.dataelement.done === response.dataelement.total
                    && response.form.done === response.form.total) {
                    clearInterval(indexFn);
                    this.meshSyncs = null;
                }
            });
        }, 1000);
    }

    getNodeStatus (status) {
        if (status.nodeStatus === 'Running' && (new Date().getTime() - new Date(status.lastUpdate).getTime()) > (45 * 1000)) {
            return 'Not Responding';
        } else return status.nodeStatus;
    }

}
