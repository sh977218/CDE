import { Http } from "@angular/http";
import { Component, OnInit } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-server-status",
    templateUrl: "./serverStatus.component.html"
})

export class ServerStatusComponent implements OnInit {

    constructor(private http: Http) {}

    statuses: any[] = [];
    esIndices: any;
    meshSyncs: any;

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

    // reIndex (i) {
    //     this.esIndices[i].count = 0;
    //     $uibModal.open({
    //         animation: false,
    //         templateUrl: 'confirmReindex.html',
    //         controller: ["i", function (i) {
    //             var isDone = false;
    //             $scope.i = i;
    //             $scope.okReIndex = function () {
    //                 $http.post('/reindex/' + i).then(function onSuccess() {
    //                     isDone = true;
    //                 });
    //                 var indexFn = setInterval(function () {
    //                     $http.get("indexCurrentNumDoc/" + i).then(function onSuccess(response) {
    //                         $scope.esIndices[i].count = response.data.count;
    //                         $scope.esIndices[i].totalCount = response.data.totalCount;
    //                         if ($scope.esIndices[i].count >= $scope.esIndices[i].totalCount && isDone) {
    //                             clearInterval(indexFn);
    //                             Alert.addAlert("success", "Finished reindex " + $scope.esIndices[i].name);
    //                             setTimeout(function () {
    //                                 $scope.esIndices[i].count = 0;
    //                                 $scope.esIndices[i].totalCount = 0;
    //                             }, 2000);
    //                         }
    //                     });
    //                 }, 5000);
    //             };
    //         }],
    //         resolve: {
    //             i: function () {
    //                 return i;
    //             }
    //         },
    //         scope: $scope
    //     }).result.then(function () {
    //     }, function () {
    //     });
    // }

    syncMesh () {
        this.http.post("/syncWithMesh", {}).subscribe();
        let indexFn = setInterval(() => {
            this.http.get('/syncWithMesh').map(r => r.json()).subscribe(response => {
                this.meshSyncs = response.data;
                if (response.cde.done === response.cde.total
                    && response.form.done === response.form.total) {
                    clearInterval(indexFn);
                    this.meshSyncs = null;
                }
            });
        }, 1000);
    }

    static getNodeStatus (status) {
        if (status.nodeStatus === 'Running' && (new Date().getTime() - new Date(status.lastUpdate).getTime()) > (45 * 1000)) {
            return 'Not Responding';
        } else return status.nodeStatus;
    }

}
