import { Component, Inject, Input, OnInit } from "@angular/core";
import { ExportService } from "../../../../core/public/export.service";
import { OrgHelperService } from "../../../../core/public/orgHelper.service";
import { UserService } from "../../../../core/public/user.service";

@Component({
    selector: "cde-cde-status-report",
    templateUrl: "./cdeStatusReport.component.html"
})
export class CdeStatusReportComponent implements OnInit {

    @Input() searchSettings: any = {};

    constructor(private exportSvc: ExportService,
                private orgSvc: OrgHelperService,
                private userSvc: UserService) {}


    gridOptionsReport = {
        columnDefs: [{field: "cdeName", displayName: "CDE Name"}, {field: 'tinyId', displayName: "NLM ID"}]
    };
    cdes: any[];

    ngOnInit () {
        let obj = {searchSettings: this.searchSettings,
            cb: cdes => {
                if (cdes.length === 0) {
                    this.cdes = [];
                    return;
                }
                if (cdes.length > 100) cdes.length = 100;
                cdes[0].validationRules.forEach((r, i) => {
                    this.gridOptionsReport.columnDefs.push({field: 'rule' + i, displayName: r.ruleName});
                });
                this.cdes = cdes.map(cde => {
                    let output: any = {};
                    cde.validationRules.forEach((rule, i) => {
                        output['rule' + i] = rule.cdePassingRule ? "Yes" : "No";
                    });
                    output.keys = Object.keys(output);
                    output.cdeName = cde.cdeName;
                    output.tinyId = cde.tinyId;
                    return output;
                });
            }
        };

        this.orgSvc.then(() => {
            this.userSvc.then(() => {
                this.exportSvc.exportSearchResults('validationRules', 'cde', obj);
            });
        });
    }

}