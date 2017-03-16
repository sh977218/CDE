import { Http } from "@angular/http";
import { Component, Inject } from "@angular/core";
import "rxjs/add/operator/map";


@Component({
    selector: "cde-log-audit",
    templateUrl: "./logAudit.component.html"
})

export class LogAuditComponent {

    gridLogEvents: any[];
    gridOptions: any;
    search: any;

    constructor(private http: Http, @Inject ("Alert") private Alert) {
        this.gridLogEvents = [];
        this.gridOptions = {
            data: 'gridLogEvents'
            , enableColumnResize: true
            , enableRowReordering: true
            , enableCellSelection: true
        };
        this.search = {currentPage: 0};
    }

    // $scope.$on('showLogsForIP', function(event, args) {
    //     $scope.search.remoteAddr = args.IP;
    //     $scope.searchLogs();
    // });

    searchLogs () {
        this.gridLogEvents = [];

        this.http.post("/logs", {query: this.search}).map(res => res.json()).subscribe((res) => {
            this.search.totalItems = res.data.count;
            // $scope.itemsPerPage = res.data.itemsPerPage;
            res.logs.forEach(log => {
                if (log !== undefined) {
                    this.gridLogEvents.push({
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
