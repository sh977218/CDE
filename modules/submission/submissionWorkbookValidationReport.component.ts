import { Component } from '@angular/core';
import { SubmissionWorkbookValidationReportService } from 'submission/submissionWorkbookValidationReport.service';

@Component({
    selector: 'cde-submission-workbook-validation-report',
    templateUrl: './submissionWorkbookValidationReport.component.html',
})
export class SubmissionWorkbookValidationReportComponent {
    constructor(public r: SubmissionWorkbookValidationReportService) {}
}
