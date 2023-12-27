import { Component } from '@angular/core';
import { SubmissionWorkbookValidationReportService } from 'submission/submissionWorkbookValidationReport.service';

@Component({
    selector: 'cde-submission-preview',
    templateUrl: './submissionPreview.component.html',
})
export class SubmissionPreviewComponent {
    constructor(public r: SubmissionWorkbookValidationReportService) {}
}
