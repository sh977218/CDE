import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { saveAs } from 'file-saver';
import { httpErrorMessage } from 'non-core/angularHelper';
import { fileInputToFormData, interruptEvent, openUrl } from 'non-core/browser';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { concat, orderedSetAdd } from 'shared/array';
import {
    SubmissionAttachResponse,
    VerifySubmissionFileProgress,
    VerifySubmissionFileReport,
} from 'shared/boundaryInterfaces/API/submission';
import { Submission, SubmissionAttachment } from 'shared/boundaryInterfaces/db/submissionDb';
import { joinCb } from 'shared/callback';
import { administrativeStatuses, assertUnreachable, Item, User } from 'shared/models.model';
import { ErrorTypes } from 'shared/node/io/excel';
import { canSubmissionReview } from 'shared/security/authorizationShared';
import { noop } from 'shared/util';
import { Concept, DataElement } from 'shared/de/dataElement.model';
import { CopyrightURL } from 'shared/form/form.model';

// type SubmissionTemplate = Omit<Submission, '_id' | 'endorsed' | 'dateModified' | 'dateSubmitted' | 'numberCdes' | 'submitterId'>;
type ConceptTypes = 'dataElementConcept' | 'objectClass' | 'property';
interface Config {
    type: ConceptTypes;
    details: {
        display: string;
        path: string;
    };
}
interface ReportCategory {
    message: string;
    rows: (number | string)[];
}

const messages: Record<string, Record<string, string>> = {
    name: {
        minlength: 'Requires at at least 3 characters. ',
    },
    collectionUrl: {
        pattern: 'Requires a valid URL. ',
    },
    collectionDescription: {
        minlength: 'Requires at least 3 characters. ',
    },
    submitterEmail: {
        minlength: 'Requires at least 5 characters. ',
        email: 'Requires a valid email address. ',
    },
    submitterOrganization: {
        minlength: 'Requires at least 2 characters. ',
    },
    submitterNameMi: {
        maxlength: '2 characters maximum. ',
    },
    organizationEmail: {
        email: 'Requires a valid email address. ',
    },
    organizationUrl: {
        pattern: 'Requires a valid URL. ',
    },
    organizationPocMi: {
        maxlength: '2 characters maximum. ',
    },
    licenseInformation: {
        minlength: 'Requires at at least 3 characters. ',
    },
};

const validateUrl = Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?');

@Component({
    templateUrl: './submissionEdit.component.html',
    styleUrls: ['./submissionEdit.component.scss'],
})
export class SubmissionEditComponent implements OnDestroy {
    set submission(submission: Partial<Submission>) {
        this._submission = submission;
        this.defaultValues(this.submission);
    }

    get submission(): Partial<Submission> {
        return this._submission;
    }

    _submission: Partial<Submission> = {};
    allNlmCurators: string[] = [''];
    allOrgCurators: string[] = [''];
    allReviewers: string[] = [''];
    canSave: boolean = true;
    canReview: boolean = false;
    conceptConfigurations: Config[] = [
        {
            type: 'dataElementConcept',
            details: {
                display: 'Data Element Concept',
                path: 'dataElementConcept.concepts.name',
            },
        },
        {
            type: 'objectClass',
            details: {
                display: 'Object Class',
                path: 'objectClass.concepts.name',
            },
        },
        {
            type: 'property',
            details: { display: 'Property', path: 'property.concepts.name' },
        },
    ];
    filteredNlmCurators: Observable<string[]>;
    filteredOrgCurators: Observable<string[]>;
    filteredReviewers: Observable<string[]>;
    manuallyUncheckedOrg: boolean = false;
    manuallyUncheckedSubmitter: boolean = false;
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
        licenseCost: FormControl<boolean>;
        licenseTraining: FormControl<boolean>;
        licenseOther: FormControl<boolean>;
        licenseInformation: FormControl<string>;
        boolWorkbook: FormControl<boolean>;
        boolWorkbookValid: FormControl<boolean>;
        boolWorkbookValidation: FormControl<boolean>;
        boolSupporting: FormControl<boolean>;
    }>;
    page3Submitted: boolean = false;
    page4Submitted: boolean = false;
    reportCdeCodes: ReportCategory[] = [];
    reportCdeColumn: ReportCategory[] = [];
    reportCdeColumnExtra: string[] = [];
    reportCdeColumnOptional: string[] = [];
    reportCdeColumnRequired: string[] = [];
    reportCdeExtra: ReportCategory[] = [];
    reportCdeLength: ReportCategory[] = [];
    reportCdeManual: ReportCategory[] = [];
    reportCdeRequired: ReportCategory[] = [];
    reportCdeSpellcheck: ReportCategory[] = [];
    reportCdeSuggestion: ReportCategory[] = [];
    reportCdeTemplate: ReportCategory[] = [];
    searchCtrlNlmCurator = new FormControl('');
    searchCtrlOrgCurator = new FormControl('');
    searchCtrlReviewer = new FormControl('');
    separatorKeysCodes: number[] = [ENTER, COMMA];
    unsubscribeUser?: () => void;
    userEmail: string = '';
    userFirstName: string = '';
    userLastName: string = '';
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
    verifySubmissionFileReport?: VerifySubmissionFileReport;

    constructor(
        private route: ActivatedRoute,
        private alert: AlertService,
        private formBuilder: NonNullableFormBuilder,
        private http: HttpClient,
        private router: Router,
        public userService: UserService
    ) {
        const { cbA: userChange, cbB: idChange } = joinCb(
            (user: User | null) => {
                if (!user) {
                    this.close();
                }
                this.canReview = canSubmissionReview(user || undefined);
                this.userEmail = user?.lastLoginInformation?.email || '';
                this.userFirstName = user?.lastLoginInformation?.firstName || '';
                this.userLastName = user?.lastLoginInformation?.lastName || '';
            },
            (submissionId: string) => {},
            (user, submissionId) => {
                if (submissionId !== this.submission._id) {
                    this.http
                        .get<Submission>('/server/submission/' + submissionId)
                        .toPromise()
                        .then((s: Submission) => {
                            this.submission = s;
                            this.defaultValues(this.submission);
                            this.copySubmissionToForm();
                        }, noop);
                }
            }
        );
        this.route.queryParams.subscribe(() => {
            if (this.route.snapshot.queryParams._id) {
                idChange(this.route.snapshot.queryParams._id);
            }
        });
        this.unsubscribeUser = this.userService.subscribe(userChange);
        this.page1 = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            version: ['', Validators.required],
            collectionUrl: ['', [Validators.required, validateUrl]],
            collectionDescription: ['', [Validators.required, Validators.minLength(3)]],
            nihInitiative: ['', Validators.required],
            nihInitiativeBranch: [''],
            additionalInformation: [''],
            administrativeStatus: [{ value: 'Not Endorsed', disabled: !this.canReview }, Validators.required],
            registrationStatus: [{ value: 'Incomplete', disabled: !this.canReview }, Validators.required],
        });
        this.page2 = this.formBuilder.group({
            submitterEmail: [
                this.userService.user?.lastLoginInformation?.email || '',
                [Validators.required, Validators.minLength(5), Validators.email],
            ],
            submitterOrganization: ['', [Validators.required, Validators.minLength(2)]],
            submitterNameTitle: [''],
            submitterNameFirst: [this.userService.user?.lastLoginInformation?.firstName || '', Validators.required],
            submitterNameMi: ['', Validators.maxLength(2)],
            submitterNameLast: [this.userService.user?.lastLoginInformation?.lastName || '', Validators.required],
            organizationEmail: ['', [Validators.required, Validators.email]],
            organizationUrl: ['', [Validators.required, validateUrl]],
            organizationPocTitle: [''],
            organizationPocFirst: ['', Validators.required],
            organizationPocMi: ['', Validators.maxLength(2)],
            organizationPocLast: ['', Validators.required],
            organizationCurators: [{ value: [] as string[], disabled: !this.canReview }],
            governanceReviewers: [{ value: [] as string[], disabled: !this.canReview }],
            nlmCurators: [{ value: [] as string[], disabled: !this.canReview }],
        });
        this.page3 = this.formBuilder.group(
            {
                licensePublic: [false],
                licenseAttribution: [false],
                licensePermission: [false],
                licenseCost: [false],
                licenseTraining: [false],
                licenseOther: [false],
                licenseInformation: ['', [Validators.minLength(3)]],
                boolWorkbook: [false, Validators.requiredTrue],
                boolWorkbookValid: [false, Validators.requiredTrue],
                boolWorkbookValidation: [false, Validators.requiredTrue],
                boolSupporting: [false],
            },
            {
                validators: control =>
                    !control.get('licensePublic')?.value &&
                    !control.get('licenseAttribution')?.value &&
                    !control.get('licensePermission')?.value &&
                    !control.get('licenseCost')?.value &&
                    !control.get('licenseTraining')?.value &&
                    !control.get('licenseOther')?.value
                        ? { oneLicenseRequired: true }
                        : null,
            }
        );

        this.filteredNlmCurators = this.searchCtrlNlmCurator.valueChanges.pipe(
            startWith(null),
            map((username: string | null) =>
                username
                    ? this.allNlmCurators.filter(u => u.toLowerCase().includes(username.toLowerCase()))
                    : this.allNlmCurators.slice()
            )
        );
        this.filteredOrgCurators = this.searchCtrlOrgCurator.valueChanges.pipe(
            startWith(null),
            map((username: string | null) =>
                username
                    ? this.allOrgCurators.filter(u => u.toLowerCase().includes(username.toLowerCase()))
                    : this.allOrgCurators.slice()
            )
        );
        this.filteredReviewers = this.searchCtrlReviewer.valueChanges.pipe(
            startWith(null),
            map((username: string | null) =>
                username
                    ? this.allReviewers.filter(u => u.toLowerCase().includes(username.toLowerCase()))
                    : this.allReviewers.slice()
            )
        );
    }

    ngOnDestroy() {
        if (this.unsubscribeUser) {
            this.unsubscribeUser();
            this.unsubscribeUser = undefined;
        }
    }

    addCategorizedReportError(errorType: ErrorTypes, errorMessage: string, errorRow: number | string) {
        const reportCategory = this.errorTypeToReportCategory(errorType);
        const reportCategoryByMessage = reportCategory.find(r => r.message === errorMessage);
        if (reportCategoryByMessage) {
            orderedSetAdd(reportCategoryByMessage.rows, errorRow);
        } else {
            reportCategory.push({ message: errorMessage, rows: [errorRow] });
        }
    }

    addNlmCurator(event: MatChipInputEvent) {
        const value = (event.value || '').trim();
        if (value) {
            arrayControlSetAdd(this.page2.controls.nlmCurators, value);
        }
        event.chipInput!.clear();
        this.searchCtrlNlmCurator.setValue(null);
    }

    addOrgCurator(event: MatChipInputEvent) {
        const value = (event.value || '').trim();
        if (value) {
            arrayControlSetAdd(this.page2.controls.organizationCurators, value);
        }
        event.chipInput!.clear();
        this.searchCtrlOrgCurator.setValue(null);
    }

    addReviewer(event: MatChipInputEvent) {
        const value = (event.value || '').trim();
        if (value) {
            arrayControlSetAdd(this.page2.controls.governanceReviewers, value);
        }
        event.chipInput!.clear();
        this.searchCtrlReviewer.setValue(null);
    }

    attachmentUpload(location: 'attachmentWorkbook' | 'attachmentSupporting', event: Event) {
        if (!this.submission._id) {
            this.alert.addAlert('error', 'Need to save before attaching');
            return;
        }
        const inputElement = event.srcElement as HTMLInputElement;
        if (
            location === 'attachmentWorkbook' &&
            inputElement.files?.[0]?.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
            this.alert.addAlert('error', 'The collection file needs to be a spreadsheet workbook.');
            return;
        }
        const formData = fileInputToFormData(inputElement);
        if (formData) {
            formData.append('id', this.submission._id);
            formData.append('location', location);
            this.http.post<SubmissionAttachResponse>('/server/submission/attach', formData).subscribe(r => {
                this.submission[location] = r;
                if (location === 'attachmentSupporting') {
                    this.page3.controls.boolSupporting.setValue(true);
                }
                if (location === 'attachmentWorkbook') {
                    this.page3.controls.boolWorkbook.setValue(true);
                }
                this.alert.addAlert('success', 'Attachment Saved');
                this.validateSubmissionFile();
            });
        }
    }

    close() {
        this.router.navigate(['/collection']);
    }

    copySubmissionToForm() {
        if (!this.canReview) {
            if (!this.submission.administrativeStatus) {
                this.submission.administrativeStatus = 'Not Endorsed';
            }
            if (!this.submission.registrationStatus) {
                this.submission.registrationStatus = 'Incomplete';
            }
        }
        this.page1.patchValue(this.submission);
        this.page2.patchValue(this.submission);
        this.page3.patchValue(this.submission);
        this.page3.patchValue({
            boolSupporting: !!this.submission.attachmentSupporting,
            boolWorkbook: !!this.submission.attachmentWorkbook,
            boolWorkbookValid: false,
            boolWorkbookValidation: false,
        });
        this.page1.markAsUntouched();
        this.page2.markAsUntouched();
        this.page3.markAsUntouched();
    }

    createCategorizedReport() {
        this.reportCdeCodes.length = 0;
        this.reportCdeColumn.length = 0;
        this.reportCdeExtra.length = 0;
        this.reportCdeLength.length = 0;
        this.reportCdeManual.length = 0;
        this.reportCdeRequired.length = 0;
        this.reportCdeSpellcheck.length = 0;
        this.reportCdeTemplate.length = 0;
        if (!this.verifySubmissionFileReport) {
            return;
        }
        this.verifySubmissionFileReport.validationErrors.cover.forEach(errorLog => {
            this.addCategorizedReportError('Template', errorLog, 'on cover page');
        });
        this.verifySubmissionFileReport.validationErrors.CDEs.forEach(errorLog => {
            const errorMessageParts = errorLog.split(':');
            const errorRow = errorMessageParts[1];
            const errorType = errorMessageParts[2] as ErrorTypes;
            const errorMessage = errorMessageParts.slice(3).join(':');
            this.addCategorizedReportError(errorType, errorMessage, errorRow);
        });
        this.createHeadingColumnReport();
        this.page3.controls.boolWorkbookValid.setValue(
            !this.reportCdeManual.length && !this.reportCdeLength.length && !this.reportCdeRequired.length
        );
    }

    createHeadingColumnReport() {
        this.reportCdeColumnExtra.length = 0;
        this.reportCdeColumnOptional.length = 0;
        this.reportCdeColumnRequired.length = 0;
        this.reportCdeColumn.forEach(m => {
            let match = /Worksheet Column "(.*)" is incorrect. Please remove to continue\./.exec(m.message);
            if (match && match.length > 1) {
                this.reportCdeColumnExtra.push(match[1]);
            }
            match = /Optional Column "(.*)" not used yet in the worksheet. This is okay\./.exec(m.message);
            if (match && match.length > 1) {
                this.reportCdeColumnOptional.push(match[1]);
            }
            match = /Required Column "(.*)" was not found in the worksheet. Add this column to continue\./.exec(
                m.message
            );
            if (match && match.length > 1) {
                this.reportCdeColumnRequired.push(match[1]);
            }
        });
    }

    errorTypeToReportCategory(errorType: ErrorTypes): ReportCategory[] {
        switch (errorType) {
            case 'Code':
                return this.reportCdeCodes;
            case 'Column Heading':
                return this.reportCdeColumn;
            case 'Extra':
                return this.reportCdeExtra;
            case 'Length':
                return this.reportCdeLength;
            case 'Manual Intervention':
                return this.reportCdeManual;
            case 'Required':
                return this.reportCdeRequired;
            case 'Spellcheck':
                return this.reportCdeSpellcheck;
            case 'Suggestion':
                return this.reportCdeSuggestion;
            case 'Template':
                return this.reportCdeTemplate;
            default:
                throw assertUnreachable(errorType);
        }
    }

    defaultValues(submission: Partial<Submission>) {
        if (!submission.administrativeStatus) {
            submission.administrativeStatus = 'Not Endorsed';
        }
        if (!submission.registrationStatus) {
            submission.registrationStatus = 'Incomplete';
        }
        if (!submission.collectionUrl) {
            submission.collectionUrl = '';
        }
        if (!submission.collectionDescription) {
            submission.collectionDescription = '';
        }
        if (!submission.nihInitiative) {
            submission.nihInitiative = '';
        }
        if (!submission.submitterEmail) {
            submission.submitterEmail = this.userService.user?.email || '';
        }
    }

    displayError(e: ReportCategory) {
        return `${e.message} Row(s) ${e.rows.join(', ')}`;
    }

    downloadCdes() {
        let report = '';
        this.verifySubmissionFileReport?.data.dataElements.forEach(de => {
            report += '\t' + JSON.stringify(de) + '\n';
        });
        this.verifySubmissionFileReport?.data.forms.forEach(form => {
            report += '\t' + JSON.stringify(form) + '\n';
        });
        const blob = new Blob([report], {
            type: 'text/text',
        });
        saveAs(blob, 'SubmissionDataElements.txt');
        this.alert.addAlert('success', 'Data Elements saved. Check downloaded files.');
    }

    downloadReport() {
        let report = '';

        function addLine(str: string): void {
            report += str + '\n';
        }

        addLine('Row numbers are based on the Workbook.');
        addLine('');

        addLine(`Submission: ${this.verifySubmissionFileReport?.data.metadata.name}`);
        addLine(`Version: ${this.verifySubmissionFileReport?.data.metadata.version}`);
        addLine('');

        addLine('Critical Errors');
        addLine(
            this.reportCdeManual.length ||
                this.reportCdeColumn.length ||
                this.reportCdeLength.length ||
                this.reportCdeRequired.length ||
                this.reportCdeTemplate.length
                ? 'These must be fixed before your submission can be accepted for review.'
                : '\tNo critical errors found.'
        );
        addLine('');
        if (this.reportCdeManual.length) {
            addLine('Assistance Required');
            for (const e of this.reportCdeManual) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportCdeColumn.length) {
            addLine('Column Heading');
            addLine('Incorrect Worksheet Column Headings: (Please remove columns to continue.)');
            for (const e of this.reportCdeColumnExtra) {
                addLine(`\t${e}`);
            }
            if (this.reportCdeColumnRequired.length) {
                addLine('Required Column Heading missing the worksheet: (Add these columns to continue.)');
                for (const e of this.reportCdeColumnRequired) {
                    addLine(`\t${e}`);
                }
            }
            if (this.reportCdeColumnOptional.length) {
                addLine('Optional Column Headings not used yet: (For your reference.)');
                for (const e of this.reportCdeColumnOptional) {
                    addLine(`\t${e}`);
                }
            }
            addLine('');
        }
        if (this.reportCdeLength.length) {
            addLine('Length of Lists');
            for (const e of this.reportCdeLength) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportCdeRequired.length) {
            addLine('Required Field');
            for (const e of this.reportCdeRequired) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportCdeTemplate.length) {
            addLine('Workbook Template');
            for (const e of this.reportCdeTemplate) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }

        addLine('');
        addLine('');

        addLine('Suggestions to Review');
        addLine(
            this.reportCdeCodes.length ||
                this.reportCdeExtra.length ||
                this.reportCdeSpellcheck.length ||
                this.reportCdeSuggestion.length
                ? 'These items were marked for your review. No need to fix any of these to continue.'
                : '\tNo suggestions to review.'
        );
        addLine('');
        if (this.reportCdeCodes.length) {
            addLine('Code Validation');
            for (const e of this.reportCdeCodes) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportCdeExtra.length) {
            addLine('Extra Unused Data');
            for (const e of this.reportCdeExtra) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportCdeSuggestion.length) {
            addLine('More Suggestions');
            for (const e of this.reportCdeSuggestion) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }
        if (this.reportCdeSpellcheck.length) {
            addLine('Spellcheck');
            for (const e of this.reportCdeSpellcheck) {
                addLine(`\t${this.displayError(e)}`);
            }
            addLine('');
        }

        const blob = new Blob([report], {
            type: 'text/text',
        });
        saveAs(blob, 'SubmissionValidation.txt');
        this.alert.addAlert('success', 'Report saved. Check downloaded files.');
    }

    endorse() {
        if (this.page1.invalid || this.page2.invalid || this.page3.invalid) {
            this.page1Submitted = true;
            this.page2Submitted = true;
            this.page3Submitted = true;
            this.page4Submitted = true;
            return;
        }
        this.save()
            .then(() => this.http.post('/server/submission/endorse', { _id: this.submission._id }).toPromise())
            .then(() => this.alert.addAlert('info', 'Endorsed'))
            .then(() => this.close())
            .catch(err => this.alert.addAlert('error', httpErrorMessage(err)));
    }

    errorCustom3(code: string): boolean | undefined {
        return this.errorsShow(this.page3) && this.page3.getError(code);
    }

    errorMessage(group: FormGroup, controlName: string): string | undefined {
        const m = messages[controlName];
        if (!m || !this.errorsControlShow(group, controlName)) {
            return '';
        }
        return Object.keys(m).reduce((acc, key) => acc + (group.get(controlName)?.hasError(key) ? m[key] : ''), '');
    }

    errorRequired1(field: string): boolean | undefined {
        return (
            this.canSave &&
            this.page1.get(field)?.hasError('required') &&
            (this.page1Submitted || this.page1.get(field)?.dirty || this.page1.get(field)?.touched)
        );
    }

    errorRequired2(field: string): boolean | undefined {
        return (
            this.canSave &&
            this.page2.get(field)?.hasError('required') &&
            (this.page2Submitted || this.page2.get(field)?.dirty || this.page2.get(field)?.touched)
        );
    }

    errorRequired3(field: string): boolean | undefined {
        return (
            this.canSave &&
            this.page3.get(field)?.hasError('required') &&
            (this.page3Submitted || this.page3.get(field)?.dirty || this.page3.get(field)?.touched)
        );
    }

    errorsControlShow(group: FormGroup, controlName: string): boolean | undefined {
        return (
            this.canSave &&
            ((group === this.page1 && this.page1Submitted) ||
                (group === this.page2 && this.page2Submitted) ||
                (group === this.page3 && this.page3Submitted) ||
                group.get(controlName)?.dirty ||
                group.get(controlName)?.touched)
        );
    }

    errorsShow(group: FormGroup): boolean {
        return (
            this.canSave &&
            ((group === this.page1 && this.page1Submitted) ||
                (group === this.page2 && this.page2Submitted) ||
                (group === this.page3 && this.page3Submitted))
        );
    }

    deGetAllConcepts(de: DataElement): Concept[] {
        return concat(de.dataElementConcept?.concepts || [], de.objectClass.concepts, de.property.concepts);
    }

    forwardToExisting() {
        if (this.route.snapshot.queryParams._id) {
            return;
        }
        this.router.navigate(['/collection/edit'], {
            queryParams: {
                _id: this.submission._id,
            },
        });
    }

    getQuestionText(elt: Item): string {
        return (
            elt.designations.find(d => d.tags && d.tags.indexOf('Preferred Question Text') > -1)?.designation ||
            elt.designations.find(d => d.tags && d.tags.indexOf('Question Text') > -1)?.designation ||
            ''
        );
    }

    getSubmissionFileUpdate(): Promise<void> {
        return this.http
            .post<VerifySubmissionFileProgress>('/server/submission/validateSubmissionFileUpdate', {
                _id: this.submission._id,
            })
            .toPromise()
            .then(progress => this.getSubmissionFileUpdateProgress(progress));
    }

    getSubmissionFileUpdateProgress(progress: VerifySubmissionFileProgress) {
        this.verifySubmissionFileProgress = progress;
        if (progress.report) {
            this.verifySubmissionFileReport = progress.report;
            this.page3.controls.boolWorkbookValidation.setValue(true);
            this.createCategorizedReport();
        } else {
            return this.getSubmissionFileUpdate();
        }
    }

    isOrgPocSubmitterPoc(): boolean {
        const page = this.page2.value;
        return (
            page.submitterEmail === page.organizationEmail &&
            page.submitterNameTitle === page.organizationPocTitle &&
            page.submitterNameFirst === page.organizationPocFirst &&
            page.submitterNameMi === page.organizationPocMi &&
            page.submitterNameLast === page.organizationPocLast
        );
    }

    isSubmitterPocSubmitter() {
        const page = this.page2.value;
        return (
            page.submitterEmail === this.userEmail &&
            page.submitterNameTitle === '' &&
            page.submitterNameFirst === this.userFirstName &&
            page.submitterNameMi === '' &&
            page.submitterNameLast === this.userLastName
        );
    }

    openAttachment(event: Event, attachment?: SubmissionAttachment) {
        if (attachment) {
            openUrl(window.location.origin + '/server/system/data/' + attachment.fileId, event, true);
            this.alert.addAlert('success', 'File downloaded. Check downloaded files.');
        } else {
            interruptEvent(event);
        }
    }

    openFileDialog(id: string) {
        const open = document.getElementById(id);
        if (open) {
            open.click();
        }
    }

    relatedCdes(concept: string, config: Config) {
        this.router.navigate(['/cde/search'], {
            queryParams: { q: config.details.path + ':"' + concept + '"' },
        });
    }

    removeNlmCurator(username: string) {
        arrayControlSetRemove(this.page2.controls.nlmCurators, username);
    }

    removeOrgCurator(username: string) {
        arrayControlSetRemove(this.page2.controls.organizationCurators, username);
    }

    removeReviewer(username: string) {
        arrayControlSetRemove(this.page2.controls.governanceReviewers, username);
    }

    save(): Promise<Submission> {
        const submission: Partial<Submission> = Object.assign(
            this.submission,
            this.page1.value,
            this.page2.value,
            this.page3.value
        );
        if (!submission.name) {
            this.alert.addAlert('error', 'Name is required');
            return Promise.reject('Name is required');
        }
        if (!submission.version) {
            this.alert.addAlert('error', 'Version is required');
            return Promise.reject('Version is required');
        }
        this.defaultValues(submission);
        return this.http
            .put<Submission>('/server/submission/', submission)
            .toPromise()
            .then(
                s => {
                    this.submission = s;
                    this.forwardToExisting();
                    return s;
                },
                (err: HttpErrorResponse) => {
                    this.alert.addAlert('fail', httpErrorMessage(err));
                    return Promise.reject(err);
                }
            );
    }

    saveAndExit() {
        this.save()
            .then(() => this.alert.addAlert('success', 'Saved'))
            .then(() => this.close());
    }

    saveIfChanged(page: FormGroup) {
        if (page.touched) {
            this.save().then(() => this.alert.addAlert('success', 'Progress Saved'));
        }
        return true;
    }

    selectedNlmCurator(event: MatAutocompleteSelectedEvent) {
        arrayControlSetAdd(this.page2.controls.nlmCurators, event.option.viewValue);
        this.searchCtrlNlmCurator.setValue(null);
    }

    selectedOrgCurator(event: MatAutocompleteSelectedEvent) {
        arrayControlSetAdd(this.page2.controls.organizationCurators, event.option.viewValue);
        this.searchCtrlOrgCurator.setValue(null);
    }

    selectedReviewer(event: MatAutocompleteSelectedEvent) {
        arrayControlSetAdd(this.page2.controls.governanceReviewers, event.option.viewValue);
        this.searchCtrlReviewer.setValue(null);
    }

    setOrgPocFromSubmitterPoc() {
        this.manuallyUncheckedOrg = false;
        this.page2.controls.organizationEmail.setValue(this.page2.controls.submitterEmail.value);
        this.page2.controls.organizationPocTitle.setValue(this.page2.controls.submitterNameTitle.value);
        this.page2.controls.organizationPocFirst.setValue(this.page2.controls.submitterNameFirst.value);
        this.page2.controls.organizationPocMi.setValue(this.page2.controls.submitterNameMi.value);
        this.page2.controls.organizationPocLast.setValue(this.page2.controls.submitterNameLast.value);
    }

    setSubmitterPocFromSubmitter() {
        this.manuallyUncheckedSubmitter = false;
        this.page2.controls.submitterEmail.setValue(this.userEmail);
        this.page2.controls.submitterNameTitle.setValue('');
        this.page2.controls.submitterNameFirst.setValue(this.userFirstName);
        this.page2.controls.submitterNameMi.setValue('');
        this.page2.controls.submitterNameLast.setValue(this.userLastName);
    }

    submit() {
        if (this.page1.invalid || this.page2.invalid || this.page3.invalid) {
            this.page1Submitted = true;
            this.page2Submitted = true;
            this.page3Submitted = true;
            this.page4Submitted = true;
            return;
        }
        this.save()
            .then(() => this.http.post('/server/submission/submit', { _id: this.submission._id }).toPromise())
            .then(() => this.alert.addAlert('info', 'Submitted'))
            .then(() => this.close());
    }

    trackByUrl(index: number, url: CopyrightURL) {
        return url.url;
    }

    updateNlmCurators() {
        this.http
            .get<string[]>('/server/user/nlmCuratorNames')
            .toPromise()
            .then(users => {
                this.allNlmCurators = users.length ? users : [''];
                this.searchCtrlNlmCurator.setValue(null);
            });
        this.page2.controls.nlmCurators.markAsTouched();
    }

    updateOrgCurators() {
        if (!this.page2.value.submitterOrganization) {
            return;
        }
        this.http
            .get<string[]>('/server/user/orgCuratorNames/' + this.page2.value.submitterOrganization)
            .toPromise()
            .then(users => {
                this.allOrgCurators = users.length ? users : [''];
                this.searchCtrlOrgCurator.setValue(null);
            });
        this.page2.controls.organizationCurators.markAsTouched();
    }

    updateReviewers() {
        this.http
            .get<string[]>('/server/user/governanceReviewerNames')
            .toPromise()
            .then(users => {
                this.allReviewers = users.length ? users : [''];
                this.searchCtrlReviewer.setValue(null);
            });
        this.page2.controls.governanceReviewers.markAsTouched();
    }

    validateSubmissionFile() {
        this.verifySubmissionFileProgress = {
            row: 0,
            rowTotal: 0,
            code: 0,
            codeTotal: 0,
            cde: 0,
        };
        this.verifySubmissionFileReport = undefined;
        this.http
            .post<VerifySubmissionFileProgress>('/server/submission/validateSubmissionFile', {
                _id: this.submission._id,
            })
            .toPromise()
            .then(progress => this.getSubmissionFileUpdateProgress(progress));
    }
}

function arrayControlSetAdd(control: FormControl, value: string) {
    orderedSetAdd(control.value, value);
    control.setValue(control.value);
    touchedAndDirty(control);
}

function arrayControlSetRemove(control: FormControl, value: string) {
    const index = control.value.indexOf(value);
    if (index >= 0) {
        control.value.splice(index, 1);
        control.setValue(control.value);
        touchedAndDirty(control);
    }
}

function touchedAndDirty(control: FormControl) {
    control.markAsTouched();
    control.markAsDirty();
}
