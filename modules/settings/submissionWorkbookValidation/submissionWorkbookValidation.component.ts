import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { SubmissionWorkbookValidationReportService } from 'submission/submissionWorkbookValidationReport.service';

@Component({
    templateUrl: './submissionWorkbookValidation.component.html',
})
export class SubmissionWorkbookValidationComponent {
    fileValidating: boolean = false;
    fileDownloading: boolean = false;

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public r: SubmissionWorkbookValidationReportService
    ) {}

    openFileDialog(id: string) {
        const open = document.getElementById(id) as HTMLInputElement;
        if (open && !this.fileValidating) {
            open.value = '';
            open.click();
        }
    }

    validateWorkbook(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
            const formData = new FormData();
            formData.append('uploadedFile', files[0]);
            this.fileValidating = true;
            this.http.post<any>('/server/loader/validateSubmissionWorkbookLoad', formData).subscribe(
                response => {
                    this.fileValidating = false;
                    this.r.report = response;
                    this.r.createCategorizedReport().then();
                },
                error => {
                    this.fileValidating = false;
                    this.alert.httpErrorMessageAlert(error);
                }
            );
        }
    }
}
