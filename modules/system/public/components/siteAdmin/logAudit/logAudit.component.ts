import { Http } from "@angular/http";
import { Component, Inject } from "@angular/core";

@Component({
    selector: "cde-log-audit",
    templateUrl: "./logAudit.component.html"
})

export class LogAuditComponent {

    gridLogEvents: any[];
    gridOptions: any;

    constructor(private http: Http, @Inject ("Alert") private Alert) {
        this.gridLogEvents = [];
        this.gridOptions = {
            data: 'gridLogEvents'
            , enableColumnResize: true
            , enableRowReordering: true
            , enableCellSelection: true
        };
    }

    $scope.search = {currentPage: 0};

    // $scope.$on('showLogsForIP', function(event, args) {
    //     $scope.search.remoteAddr = args.IP;
    //     $scope.searchLogs();
    // });

    // $scope.pageChanged = function() {
    //     $scope.searchLogs();
    // };

    searchLogs () {
        this.gridLogEvents = [];

        this.http.post("/logs", {query: $scope.search}).then(function (res) {
            if (res.data.error !== undefined) {
                this.Alert.addAlert("danger", res.data.error);
            }
            $scope.totalItems = res.data.count;
            $scope.itemsPerPage = res.data.itemsPerPage;
            res.data.logs.forEach(function(log) {
                if (log !== undefined) {
                    $scope.gridLogEvents.push({
                        date: new Date(log.date).toLocaleString()
                        , ip: log.remoteAddr
                        , url: log.url
                        , method: log.method
                        , status: log.httpStatus
                        , respTime: log.responseTime
                    });
                }
            });
        });
    };

}
