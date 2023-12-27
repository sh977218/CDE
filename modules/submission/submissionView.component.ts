import { Component, Input, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { interruptEvent, openUrl } from 'non-core/browser';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Submission, SubmissionAttachment } from 'shared/boundaryInterfaces/db/submissionDb';
import { administrativeStatuses } from 'shared/models.model';
import { VerifySubmissionFileProgress } from 'shared/boundaryInterfaces/API/submission';
import { SubmissionWorkbookValidationReportService } from 'submission/submissionWorkbookValidationReport.service';

const controlDisabled = [{ value: '', disabled: true }];
const controlBoolDisabled = [{ value: false, disabled: true }];
const controlArrayDisabled = [{ value: [] as string[], disabled: true }];

@Component({
    templateUrl: './submissionEdit.component.html',
    styleUrls: ['./submissionEdit.component.scss'],
})
export class SubmissionViewComponent implements OnInit {
    @Input() submission: Partial<Submission> = {};
    canReview: boolean = false;
    canSave: boolean = false;
    filteredNlmCurators: Observable<string[]>;
    filteredOrgCurators: Observable<string[]>;
    filteredReviewers: Observable<string[]>;
    page1: FormGroup<{
        additionalInformation: FormControl<string>;
        administrativeStatus: FormControl<string>;
        collectionDescription: FormControl<string>;
        collectionUrl: FormControl<string>;
        name: FormControl<string>;
        nihInitiative: FormControl<string>;
        nihInitiativeBranch: FormControl<string>;
        registrationStatus: FormControl<string>;
        version: FormControl<string>;
    }>;
    page1Submitted: boolean = false;
    page2: FormGroup<{
        organizationUrl: FormControl<string>;
        organizationEmail: FormControl<string>;
        organizationPocTitle: FormControl<string>;
        organizationPocFirst: FormControl<string>;
        organizationPocMi: FormControl<string>;
        organizationPocLast: FormControl<string>;
        submitterOrganization: FormControl<string>;
        submitterEmail: FormControl<string>;
        submitterNameTitle: FormControl<string>;
        submitterNameFirst: FormControl<string>;
        submitterNameMi: FormControl<string>;
        submitterNameLast: FormControl<string>;
        organizationCurators: FormControl<string[]>;
        governanceReviewers: FormControl<string[]>;
        nlmCurators: FormControl<string[]>;
    }>;
    page2Submitted: boolean = false;
    page3: FormGroup<{
        licensePublic: FormControl<boolean>;
        licenseAttribution: FormControl<boolean>;
        licensePermission: FormControl<boolean>;
        licenseInformation: FormControl<string>;
        licenseOther: FormControl<boolean>;
        licenseCost: FormControl<boolean>;
        licenseTraining: FormControl<boolean>;
        boolWorkbook: FormControl<boolean>;
        boolWorkbookValid: FormControl<boolean>;
        boolWorkbookValidation: FormControl<boolean>;
        boolSupporting: FormControl<boolean>;
    }>;
    page3Submitted: boolean = false;
    page4Submitted: boolean = false;
    searchCtrlNlmCurator = new FormControl('');
    searchCtrlOrgCurator = new FormControl('');
    searchCtrlReviewer = new FormControl('');
    separatorKeysCodes: number[] = [ENTER, COMMA];
    validAdminStatus = administrativeStatuses;
    validRegStatuses = [
        'Preferred Standard',
        'Standard',
        'Qualified',
        'Recorded',
        'Candidate',
        'Incomplete',
        'Retired',
    ];
    verifySubmissionFileProgress?: VerifySubmissionFileProgress;

    constructor(
        private alert: AlertService,
        public dialogRef: MatDialogRef<SubmissionViewComponent, void>,
        private formBuilder: NonNullableFormBuilder,
        public r: SubmissionWorkbookValidationReportService
    ) {
        this.page1 = this.formBuilder.group({
            name: controlDisabled,
            version: controlDisabled,
            collectionUrl: controlDisabled,
            collectionDescription: controlDisabled,
            nihInitiative: controlDisabled,
            nihInitiativeBranch: controlDisabled,
            additionalInformation: controlDisabled,
            administrativeStatus: controlDisabled,
            registrationStatus: controlDisabled,
        });
        this.page2 = this.formBuilder.group({
            submitterEmail: controlDisabled,
            submitterOrganization: controlDisabled,
            submitterNameTitle: controlDisabled,
            submitterNameFirst: controlDisabled,
            submitterNameMi: controlDisabled,
            submitterNameLast: controlDisabled,
            organizationEmail: controlDisabled,
            organizationUrl: controlDisabled,
            organizationPocTitle: controlDisabled,
            organizationPocFirst: controlDisabled,
            organizationPocMi: controlDisabled,
            organizationPocLast: controlDisabled,
            organizationCurators: controlArrayDisabled,
            governanceReviewers: controlArrayDisabled,
            nlmCurators: controlArrayDisabled,
        });
        this.page3 = this.formBuilder.group({
            licensePublic: controlBoolDisabled,
            licenseAttribution: controlBoolDisabled,
            licensePermission: controlBoolDisabled,
            licenseInformation: controlDisabled,
            licenseOther: controlBoolDisabled,
            licenseCost: controlBoolDisabled,
            licenseTraining: controlBoolDisabled,
            boolWorkbook: controlBoolDisabled,
            boolWorkbookValid: controlBoolDisabled,
            boolWorkbookValidation: controlBoolDisabled,
            boolSupporting: controlBoolDisabled,
        });

        this.filteredNlmCurators = this.searchCtrlNlmCurator.valueChanges.pipe(
            startWith(null),
            map(() => [''])
        );
        this.filteredOrgCurators = this.searchCtrlOrgCurator.valueChanges.pipe(
            startWith(null),
            map(() => [''])
        );
        this.filteredReviewers = this.searchCtrlReviewer.valueChanges.pipe(
            startWith(null),
            map(() => [''])
        );
    }

    ngOnInit() {
        this.copySubmissionToForm();
    }

    addNlmCurator(event: MatChipInputEvent) {}
    addOrgCurator(event: MatChipInputEvent) {}
    addReviewer(event: MatChipInputEvent) {}
    attachmentUpload(location: 'attachmentWorkbook' | 'attachmentSupporting', event: Event) {}

    copySubmissionToForm() {
        this.page1.patchValue(this.submission);
        this.page2.patchValue(this.submission);
    }

    endorse() {}

    errorCustom3(code: string): boolean | undefined {
        return false;
    }

    errorMessage(group: FormGroup, controlName: string): string | undefined {
        return undefined;
    }

    errorRequired1(field: string): boolean | undefined {
        return false;
    }

    errorRequired2(field: string): boolean | undefined {
        return false;
    }

    errorRequired3(field: string): boolean | undefined {
        return false;
    }

    openAttachment(event: Event, attachment?: SubmissionAttachment) {
        if (attachment) {
            openUrl(window.location.origin + '/server/system/data/' + attachment.fileId, event, true);
        } else {
            interruptEvent(event);
        }
    }

    openFileDialog(id: string) {}
    removeNlmCurator(username: string) {}
    removeOrgCurator(username: string) {}
    removeReviewer(username: string) {}
    save() {}
    saveIfChanged(page: FormGroup) {
        return true;
    }
    selectedNlmCurator(event: MatAutocompleteSelectedEvent) {}
    selectedOrgCurator(event: MatAutocompleteSelectedEvent) {}
    selectedReviewer(event: MatAutocompleteSelectedEvent) {}
    submit() {}
    updateNlmCurators() {}
    updateOrgCurators() {}
    updateReviewers() {}
    validateSubmissionFile() {}
}
