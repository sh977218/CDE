import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '_app/user.service';
import _noop from 'lodash/noop';
import { ExportRecord, ExportService } from 'non-core/export.service';
import { OrgHelperService } from 'non-core/orgHelper.service';

type ExportStatusRecord = ExportRecord | {results: string[]};

@Component({
    templateUrl: './cdeStatusReport.component.html'
})
export class CdeStatusReportComponent implements OnInit {
    gridOptionsReport = {
        columnDefs: [{field: 'cdeName', displayName: 'CDE Name'}, {field: 'tinyId', displayName: 'NLM ID'}]
    };
    message?: string;
    results?: ExportStatusRecord[];
    state: 'fail' | 'message' | 'processing' | 'fail' = 'processing';

    constructor(private exportSvc: ExportService,
                private orgSvc: OrgHelperService,
                private userSvc: UserService,
                private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.orgSvc.then(() => {
            this.userSvc.then(() => {
                this.exportSvc.exportSearchResults(
                    'validationRules',
                    'cde',
                    {
                        searchSettings: JSON.parse(this.route.snapshot.queryParams.searchSettings),
                        status: this.route.snapshot.queryParams.status
                    },
                    (records?: ExportRecord[]) => {
                        if (!records) {
                            this.state = 'message';
                            this.message = 'Validation finished with Errors. This is possibly due to a network error. Please try again.';
                            return;
                        }
                        if (records.length === 0) {
                            this.state = 'message';
                            this.message = 'All CDEs pass validation rules.';
                            return;
                        }
                        this.state = 'fail';
                        if (records.length > 100) {
                            records.length = 100;
                        }
                        (records[0].validationRules || []).forEach((r, i) => {
                            this.gridOptionsReport.columnDefs.push({field: 'rule' + i, displayName: r.ruleName});
                        });
                        this.results = records.map(cde => ({
                            cdeName: cde.cdeName,
                            results: (cde.validationRules || []).map(rule => rule.ruleError ? 'No' : 'Yes'),
                            tinyId: cde.tinyId
                        }));
                    }
                );
            }, err => {
                this.state = 'message';
                this.message = 'Need to login to complete this task.';
            });
        }, _noop);
    }
}
